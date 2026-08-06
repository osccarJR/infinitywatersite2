import LegalPageLayout from './LegalPageLayout';
import { PRIVACY_POLICY } from '../content/privacyPolicy';

export default function PrivacyPolicyPage() {
  return <LegalPageLayout document={PRIVACY_POLICY} />;
}
