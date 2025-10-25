"""
LLM service for generating fraud risk explanations using OpenAI API.
"""
import os
from typing import Dict, List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


class LLMExplainer:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        self.client = OpenAI(api_key=api_key)
        
        self.system_prompt = """You are a compliance analyst specializing in AML (Anti-Money Laundering) and KYC (Know Your Customer) fraud detection.

Your role is to explain fraud risk scores in clear, professional language that compliance officers can understand.

Guidelines:
- Cite specific AML/KYC red flags (e.g., structuring, layering, shared devices)
- Keep explanations under 100 words
- Never expose full personal identifiers (mask if needed)
- Use professional, factual tone
- Focus on behavioral patterns, not speculation
"""
    
    def generate_explanation(self, account_context: Dict) -> str:
        """Generate natural language explanation for account risk."""
        account_id = account_context.get('account_id', 'Unknown')
        risk_score = account_context.get('risk_score', 0)
        signals = account_context.get('signals', [])
        transaction_count = account_context.get('transaction_count', 0)
        connected_accounts = account_context.get('connected_accounts', 0)
        
        # Build user prompt
        signal_descriptions = []
        for signal in signals:
            signal_type = signal.get('type', '')
            details = signal.get('details', '')
            severity = signal.get('severity', 'low')
            
            signal_descriptions.append(f"- {signal_type.upper()} ({severity} severity): {details}")
        
        signals_text = "\n".join(signal_descriptions) if signal_descriptions else "No specific signals detected"
        
        user_prompt = f"""Account ID: {self._mask_identifier(account_id)}
Risk Score: {risk_score}/10
Transaction Count: {transaction_count}
Connected Accounts: {connected_accounts}

Detected Signals:
{signals_text}

Provide a concise explanation of why this account is flagged as high-risk, citing relevant AML/KYC concerns."""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=200,
                temperature=0.3
            )
            
            explanation = response.choices[0].message.content.strip()
            return explanation
            
        except Exception as e:
            # Fallback to rule-based explanation
            return self._generate_fallback_explanation(account_context)
    
    def generate_batch_explanations(self, accounts_context: List[Dict]) -> Dict[str, str]:
        """Generate explanations for multiple accounts."""
        explanations = {}
        
        for context in accounts_context:
            account_id = context.get('account_id')
            if account_id:
                explanations[account_id] = self.generate_explanation(context)
        
        return explanations
    
    def _mask_identifier(self, identifier: str) -> str:
        """Mask sensitive identifiers for privacy."""
        if len(identifier) <= 4:
            return identifier
        return identifier[:2] + "***" + identifier[-2:]
    
    def _generate_fallback_explanation(self, account_context: Dict) -> str:
        """Generate rule-based explanation when LLM is unavailable."""
        risk_score = account_context.get('risk_score', 0)
        signals = account_context.get('signals', [])
        
        if risk_score < 3:
            return "Low risk account with normal transaction patterns and no significant red flags detected."
        
        explanation_parts = []
        
        for signal in signals:
            signal_type = signal.get('type', '')
            details = signal.get('details', '')
            
            if signal_type == 'shared_device':
                explanation_parts.append(f"Multiple users accessing from same device - potential account takeover or mule network.")
            elif signal_type == 'shared_ip':
                explanation_parts.append(f"Shared IP address with other users - possible coordinated activity.")
            elif signal_type == 'structuring':
                explanation_parts.append(f"Structuring pattern detected - multiple small transactions to evade reporting thresholds.")
            elif signal_type == 'circular_flow':
                explanation_parts.append(f"Circular transaction pattern - potential layering to obscure fund origins.")
        
        if not explanation_parts:
            explanation_parts.append("Elevated risk based on network analysis and transaction patterns.")
        
        return " ".join(explanation_parts[:3])  # Limit to top 3 reasons
    
    def chat_about_compliance(self, country: str, user_question: str, conversation_history: List[Dict] = None) -> str:
        """Generate compliance information about a specific country."""
        system_prompt = f"""You are an expert in international AML/KYC compliance regulations and financial crime prevention.

You specialize in explaining country-specific compliance requirements, regulatory frameworks, and fraud risks for: {country}

Guidelines:
- Provide accurate, up-to-date information about {country}'s AML/KYC regulations
- Mention relevant regulatory bodies (e.g., FinCEN, FCA, MAS)
- Cite specific laws when applicable (e.g., Bank Secrecy Act, EU AML Directives)
- Keep responses concise (under 150 words)
- Use professional, factual tone
- If you don't know specific details, provide general guidance
"""

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current question
        messages.append({"role": "user", "content": user_question})
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=300,
                temperature=0.5
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Compliance chat error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Fallback response for demo when quota exceeded
            if "insufficient_quota" in str(e) or "429" in str(e):
                return self._get_fallback_compliance_response(country, user_question)
            
            return f"Unable to retrieve compliance information for {country}. Error: {str(e)}"
    
    def _get_fallback_compliance_response(self, country: str, question: str) -> str:
        """Provide fallback compliance information when OpenAI is unavailable."""
        responses = {
            "Canada": {
                "kyc": "Canada's KYC regulations are governed by FINTRAC (Financial Transactions and Reports Analysis Centre). Key requirements include: customer identification, beneficial ownership verification, ongoing monitoring, and suspicious transaction reporting. Financial institutions must verify identity using government-issued ID and maintain records for 5 years.",
                "aml": "Canada's AML framework is overseen by FINTRAC under the Proceeds of Crime (Money Laundering) and Terrorist Financing Act (PCMLTFA). Requirements include: risk-based approach, customer due diligence, transaction monitoring, and reporting suspicious activities (STRs) and large cash transactions (LCTRs) over $10,000 CAD.",
                "default": "Canada's financial compliance is regulated by FINTRAC. Key areas include KYC (Know Your Customer), AML (Anti-Money Laundering), and CTF (Counter-Terrorist Financing). Financial institutions must implement risk-based programs, verify customer identity, monitor transactions, and report suspicious activities."
            },
            "United States": {
                "kyc": "US KYC regulations are enforced by FinCEN under the Bank Secrecy Act (BSA). Requirements include Customer Identification Program (CIP), Customer Due Diligence (CDD), and Enhanced Due Diligence (EDD) for high-risk customers. Beneficial ownership rules require identifying individuals owning 25%+ of entities.",
                "aml": "US AML compliance is governed by FinCEN and enforced through the Bank Secrecy Act (BSA) and USA PATRIOT Act. Requirements include: AML program, SAR filing for suspicious activities, CTR filing for transactions over $10,000, and OFAC sanctions screening.",
                "default": "US financial compliance is overseen by FinCEN, OCC, and FDIC. Key regulations include the Bank Secrecy Act (BSA), USA PATRIOT Act, and OFAC sanctions. Financial institutions must implement comprehensive AML/KYC programs, file SARs and CTRs, and screen against sanctions lists."
            }
        }
        
        # Get country-specific responses or use default
        country_responses = responses.get(country, {
            "default": f"{country}'s financial compliance typically includes KYC (customer identification), AML (transaction monitoring), and regulatory reporting requirements. Specific regulations vary by jurisdiction. Consult local regulatory authorities for detailed requirements."
        })
        
        # Match question to response type
        question_lower = question.lower()
        if "kyc" in question_lower or "know your customer" in question_lower or "identification" in question_lower:
            return country_responses.get("kyc", country_responses.get("default"))
        elif "aml" in question_lower or "money laundering" in question_lower or "laundering" in question_lower:
            return country_responses.get("aml", country_responses.get("default"))
        else:
            return country_responses.get("default")
