import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GlobalMetricsCardsProps {
  totalTenants: number;
  activeTenants: number;
  totalTokensUsed: number;
}

export function GlobalMetricsCards({ totalTenants, activeTenants, totalTokensUsed }: GlobalMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Total Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{totalTenants}</div>
          <p className="text-xs text-emerald-500 mt-1">{activeTenants} activos actualmente</p>
        </CardContent>
      </Card>
      
      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Consumo Global de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{totalTokensUsed.toLocaleString()}</div>
          <p className="text-xs text-neutral-500 mt-1">Tokens Groq procesados</p>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900/50 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Salud del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-400">100%</div>
          <p className="text-xs text-neutral-500 mt-1">Sistemas operando normalmente</p>
        </CardContent>
      </Card>
    </div>
  )
}
