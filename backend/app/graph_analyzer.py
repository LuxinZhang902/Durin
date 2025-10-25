"""
Graph-based fraud detection engine using NetworkX.
Analyzes relationships between users, accounts, devices, and IPs.
"""
import networkx as nx
from datetime import datetime
from typing import Dict, List, Tuple, Set
from collections import defaultdict
import pandas as pd


class FraudGraphAnalyzer:
    def __init__(self):
        self.graph = nx.Graph()
        self.risk_scores = {}
        self.fraud_signals = defaultdict(list)
        
    def build_graph(self, users_df: pd.DataFrame, transactions_df: pd.DataFrame) -> Dict:
        """Build fraud detection graph from KYC and transaction data."""
        self.graph.clear()
        self.risk_scores.clear()
        self.fraud_signals.clear()
        
        # Track countries for creating country nodes
        countries = set()
        
        # Add user nodes with attributes
        for _, user in users_df.iterrows():
            user_id = str(user['user_id'])
            country = str(user.get('country', ''))
            
            self.graph.add_node(
                user_id,
                node_type='user',
                user_name=str(user.get('user_name', '')),
                device_id=str(user.get('device_id', '')),
                ip=str(user.get('ip', '')),
                country=country
            )
            
            # Track country for later
            if country:
                countries.add(country)
        
        # Add country nodes
        for country in countries:
            country_node_id = f"COUNTRY_{country.replace(' ', '_').upper()}"
            self.graph.add_node(
                country_node_id,
                node_type='country',
                country_name=country,
                user_count=0
            )
            
            # Link users to their country nodes
            for _, user in users_df.iterrows():
                user_id = str(user['user_id'])
                user_country = str(user.get('country', ''))
                if user_country == country:
                    self.graph.add_edge(
                        user_id,
                        country_node_id,
                        edge_type='located_in',
                        weight=1
                    )
                    # Increment user count
                    self.graph.nodes[country_node_id]['user_count'] += 1
        
        # Add transaction edges
        for _, txn in transactions_df.iterrows():
            from_acc = str(txn['from'])
            to_acc = str(txn['to'])
            amount = float(txn['amount'])
            timestamp = str(txn['timestamp'])
            device = str(txn.get('device_id', ''))
            ip = str(txn.get('ip', ''))
            txn_type = str(txn.get('transaction_type', 'user_to_user'))
            
            # Handle country-to-country transactions
            if txn_type == 'country_to_country':
                # Use country node IDs
                from_node = f"COUNTRY_{from_acc.replace(' ', '_').upper()}"
                to_node = f"COUNTRY_{to_acc.replace(' ', '_').upper()}"
            else:
                # Regular user transactions
                from_node = from_acc
                to_node = to_acc
                
                # Add account nodes if not exist
                for acc in [from_node, to_node]:
                    if acc not in self.graph:
                        self.graph.add_node(acc, node_type='account')
            
            # Add transaction edge
            if self.graph.has_edge(from_node, to_node):
                # Update existing edge
                edge_data = self.graph[from_node][to_node]
                edge_data['count'] = edge_data.get('count', 1) + 1
                edge_data['total_amount'] = edge_data.get('total_amount', 0) + amount
                edge_data['transaction_type'] = txn_type
                edge_data['transactions'].append({
                    'amount': amount,
                    'timestamp': timestamp,
                    'device': device,
                    'ip': ip
                })
            else:
                self.graph.add_edge(
                    from_node,
                    to_node,
                    count=1,
                    total_amount=amount,
                    transaction_type=txn_type,
                    transactions=[{
                        'amount': amount,
                        'timestamp': timestamp,
                        'device': device,
                        'ip': ip
                    }]
                )
        
        # Analyze fraud patterns
        self._detect_shared_devices()
        self._detect_shared_ips()
        self._detect_structuring()
        self._detect_circular_flows()
        self._calculate_risk_scores()
        
        return self._generate_results()
    
    def _detect_shared_devices(self):
        """Detect multiple users sharing same device."""
        device_to_users = defaultdict(list)
        
        for node, data in self.graph.nodes(data=True):
            if data.get('node_type') == 'user':
                device = data.get('device_id')
                if device:
                    device_to_users[device].append(node)
        
        for device, users in device_to_users.items():
            if len(users) > 1:
                for user in users:
                    self.fraud_signals[user].append({
                        'type': 'shared_device',
                        'severity': 'high',
                        'details': f'Shares device {device} with {len(users)-1} other user(s)',
                        'related_users': [u for u in users if u != user]
                    })
    
    def _detect_shared_ips(self):
        """Detect multiple users sharing same IP address."""
        ip_to_users = defaultdict(list)
        
        for node, data in self.graph.nodes(data=True):
            if data.get('node_type') == 'user':
                ip = data.get('ip')
                if ip:
                    ip_to_users[ip].append(node)
        
        for ip, users in ip_to_users.items():
            if len(users) > 1:
                for user in users:
                    self.fraud_signals[user].append({
                        'type': 'shared_ip',
                        'severity': 'medium',
                        'details': f'Shares IP {ip} with {len(users)-1} other user(s)',
                        'related_users': [u for u in users if u != user]
                    })
    
    def _detect_structuring(self):
        """Detect structuring pattern - multiple small transactions in short time."""
        for node in self.graph.nodes():
            if self.graph.nodes[node].get('node_type') == 'account':
                # Get all outgoing transactions
                outgoing_txns = []
                for neighbor in self.graph.neighbors(node):
                    if self.graph.has_edge(node, neighbor):
                        edge_data = self.graph[node][neighbor]
                        outgoing_txns.extend(edge_data.get('transactions', []))
                
                # Check for structuring pattern
                if len(outgoing_txns) >= 3:
                    # Sort by timestamp
                    try:
                        sorted_txns = sorted(outgoing_txns, key=lambda x: x['timestamp'])
                        
                        # Check for small amounts (< 1000) in short time window
                        small_txns = [t for t in sorted_txns if t['amount'] < 1000]
                        
                        if len(small_txns) >= 3:
                            self.fraud_signals[node].append({
                                'type': 'structuring',
                                'severity': 'high',
                                'details': f'{len(small_txns)} small transactions (<$1k) detected',
                                'transaction_count': len(small_txns),
                                'amounts': [t['amount'] for t in small_txns[:5]]
                            })
                    except:
                        pass
    
    def _detect_circular_flows(self):
        """Detect circular money flows (potential layering)."""
        # Find cycles in the graph
        try:
            cycles = list(nx.simple_cycles(self.graph.to_directed()))
            
            for cycle in cycles:
                if len(cycle) >= 3:  # Meaningful cycles
                    for node in cycle:
                        if node not in self.fraud_signals or not any(s['type'] == 'circular_flow' for s in self.fraud_signals[node]):
                            self.fraud_signals[node].append({
                                'type': 'circular_flow',
                                'severity': 'high',
                                'details': f'Part of circular transaction pattern with {len(cycle)} accounts',
                                'cycle_length': len(cycle)
                            })
        except:
            pass
    
    def _calculate_risk_scores(self):
        """Calculate risk score (0-10) for each account based on signals."""
        for node in self.graph.nodes():
            signals = self.fraud_signals.get(node, [])
            
            if not signals:
                self.risk_scores[node] = 0.0
                continue
            
            score = 0.0
            
            # Weight different signal types
            for signal in signals:
                if signal['type'] == 'shared_device':
                    score += 3.0
                elif signal['type'] == 'shared_ip':
                    score += 1.5
                elif signal['type'] == 'structuring':
                    score += 3.5
                elif signal['type'] == 'circular_flow':
                    score += 2.5
            
            # Add network centrality bonus
            try:
                degree = self.graph.degree(node)
                if degree > 5:
                    score += 1.0
            except:
                pass
            
            # Cap at 10
            self.risk_scores[node] = min(10.0, score)
    
    def _generate_results(self) -> Dict:
        """Generate analysis results."""
        nodes = []
        edges = []
        
        # Prepare nodes for visualization
        for node, data in self.graph.nodes(data=True):
            node_type = data.get('node_type', 'account')
            risk = self.risk_scores.get(node, 0.0)
            
            node_data = {
                'id': node,
                'type': node_type,
                'risk_score': round(risk, 2),
                'signals': self.fraud_signals.get(node, [])
            }
            
            # Add type-specific attributes
            if node_type == 'country':
                node_data.update({
                    'name': data.get('country_name', ''),
                    'country': data.get('country_name', ''),
                    'user_count': data.get('user_count', 0)
                })
            else:
                node_data.update({
                    'name': data.get('user_name', ''),
                    'device_id': data.get('device_id', ''),
                    'ip': data.get('ip', ''),
                    'country': data.get('country', '')
                })
            
            nodes.append(node_data)
        
        # Prepare edges for visualization
        for u, v, data in self.graph.edges(data=True):
            edges.append({
                'source': u,
                'target': v,
                'count': data.get('count', 1),
                'total_amount': round(data.get('total_amount', 0), 2),
                'transaction_type': data.get('transaction_type', 'user_to_user'),
                'edge_type': data.get('edge_type', 'transaction')
            })
        
        # Sort nodes by risk score
        high_risk_accounts = sorted(
            [n for n in nodes if n['risk_score'] > 5.0],
            key=lambda x: x['risk_score'],
            reverse=True
        )
        
        return {
            'nodes': nodes,
            'edges': edges,
            'high_risk_accounts': high_risk_accounts,
            'summary': {
                'total_accounts': len([n for n in nodes if n['type'] == 'account']),
                'total_users': len([n for n in nodes if n['type'] == 'user']),
                'total_transactions': len(edges),
                'high_risk_count': len(high_risk_accounts)
            }
        }
    
    def get_account_context(self, account_id: str) -> Dict:
        """Get detailed context for an account for LLM explanation."""
        if account_id not in self.graph:
            return {}
        
        signals = self.fraud_signals.get(account_id, [])
        risk_score = self.risk_scores.get(account_id, 0.0)
        
        # Get transaction patterns
        neighbors = list(self.graph.neighbors(account_id))
        transactions = []
        
        for neighbor in neighbors:
            if self.graph.has_edge(account_id, neighbor):
                edge_data = self.graph[account_id][neighbor]
                transactions.append({
                    'to': neighbor,
                    'count': edge_data.get('count', 1),
                    'total_amount': edge_data.get('total_amount', 0)
                })
        
        return {
            'account_id': account_id,
            'risk_score': risk_score,
            'signals': signals,
            'transaction_count': len(transactions),
            'connected_accounts': len(neighbors),
            'transactions': transactions[:10]  # Limit for context
        }
