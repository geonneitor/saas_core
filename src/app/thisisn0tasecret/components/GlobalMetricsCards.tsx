import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GlobalMetricsCardsProps {
  totalTenants: number;
  activeTenants: number;
  totalTokensUsed: number;
}

export function GlobalMetricsCards({ totalTenants, activeTenants, totalTokensUsed }: GlobalMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card 
        className="border-brutal border-brutal-hover transition-colors rounded-none"
        style={{ backgroundColor: 'var(--acid-card)' }}
      >
        <CardHeader className="pb-2">
          <CardTitle 
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: 'var(--acid-text-dim)' }}
          >
            Total Tenants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="text-3xl font-bold"
            style={{ 
              color: 'var(--acid-neon)', 
              fontFamily: 'var(--font-geist-mono)' 
            }}
          >
            {totalTenants}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--acid-neon-dim)' }}>
            {activeTenants} activos actualmente
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className="border-brutal border-brutal-hover transition-colors rounded-none"
        style={{ backgroundColor: 'var(--acid-card)' }}
      >
        <CardHeader className="pb-2">
          <CardTitle 
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: 'var(--acid-text-dim)' }}
          >
            Consumo Global de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="text-3xl font-bold"
            style={{ 
              color: 'var(--acid-neon)', 
              fontFamily: 'var(--font-geist-mono)' 
            }}
          >
            {totalTokensUsed.toLocaleString()}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--acid-text-dim)' }}>
            Tokens Groq procesados
          </p>
        </CardContent>
      </Card>

      <Card 
        className="border-brutal border-brutal-hover transition-colors rounded-none"
        style={{ backgroundColor: 'var(--acid-card)' }}
      >
        <CardHeader className="pb-2">
          <CardTitle 
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: 'var(--acid-text-dim)' }}
          >
            Salud del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="text-3xl font-bold"
            style={{ 
              color: 'var(--acid-neon)', 
              fontFamily: 'var(--font-geist-mono)' 
            }}
          >
            100%
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--acid-text-dim)' }}>
            Sistemas operando normalmente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
