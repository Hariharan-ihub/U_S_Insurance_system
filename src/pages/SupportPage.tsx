import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PhoneCall, HelpCircle, Mail } from 'lucide-react';

export function SupportPage() {
  const faqList = [
    { q: 'How do I add family dependents?', a: 'Dependents can be added during open enrollment or qualifying life events under Member Profile.' },
    { q: 'What is a prior authorization?', a: 'A approval required from the insurer before receiving certain medical care like surgeries or MRIs.' },
    { q: 'How long do claims take to process?', a: 'Usually 7 to 14 business days depending on in-network verification.' },
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Help & Support</h2>
        <p className="text-sm text-slate-500">Contact our administrator desk or search help documents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary-500" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqList.map((faq) => (
                <div key={faq.q} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{faq.q}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Direct Support Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-500 dark:text-slate-400 text-left">
              <div className="flex gap-3 items-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <PhoneCall className="h-5 w-5 text-primary-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Call Member Support</p>
                  <p className="font-mono mt-0.5">1-800-555-0199 (24/7)</p>
                </div>
              </div>

              <div className="flex gap-3 items-center p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Mail className="h-5 w-5 text-primary-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Email Administrator</p>
                  <p className="font-mono mt-0.5">admin@healthguard.gov</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
