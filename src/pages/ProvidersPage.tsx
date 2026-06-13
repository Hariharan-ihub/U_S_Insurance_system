import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Search, MapPin, Phone, Star, ShieldCheck } from 'lucide-react';

export function ProvidersPage() {
  const providers = [
    { name: 'Dr. Amit Patel, MD', specialty: 'General Cardiovascular Disease', hospital: 'City Cardiac Care', phone: '(555) 123-4567', rating: 4.9, address: '123 Medical Plaza, Suite 400', distance: '2.3 miles' },
    { name: 'Dr. Sarah Johnson, MD', specialty: 'Family Medicine / PCP', hospital: 'Eastside Family Practice', phone: '(555) 987-6543', rating: 4.7, address: '456 Wellness Way', distance: '4.1 miles' },
    { name: 'Dr. Kevin Miller, MD', specialty: 'Orthopedic Surgery', hospital: 'Apex Bone & Joint', phone: '(555) 246-8135', rating: 4.8, address: '789 Ortho Blvd', distance: '5.8 miles' },
  ];

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Find Care & Providers</h2>
        <p className="text-sm text-slate-500">Search and navigate through our verified in-network provider directories.</p>
      </div>

      <Card className="p-4 flex gap-3 items-center">
        <Search className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search specialty, doctor name, hospital..."
          className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100"
          onClick={() => alert('Search directories is set (sandbox)...')}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((p) => (
          <Card key={p.name} className="hover:-translate-y-1 hover:shadow-md transition-all">
            <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/80">
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                  <ShieldCheck className="h-3 w-3" />
                  <span>In-Network</span>
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{p.rating}</span>
                </span>
              </div>
              <CardTitle className="text-base font-bold mt-3">{p.name}</CardTitle>
              <CardDescription className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">{p.specialty}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex gap-2 items-center">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{p.address} ({p.distance})</span>
              </div>
              <div className="flex gap-2 items-center">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300">{p.phone}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
