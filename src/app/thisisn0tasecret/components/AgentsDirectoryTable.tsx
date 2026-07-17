'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { promoteUserToAgent } from "../actions"

interface AgentsDirectoryTableProps {
  agents: {
    id: string;
    email?: string;
    role: string;
    stripe_onboarding_complete?: boolean;
    tenantCount: number;
  }[];
}

export function AgentsDirectoryTable({ agents }: AgentsDirectoryTableProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  async function handlePromote(formData: FormData) {
    setLoading(true);
    setError('');
    const res = await promoteUserToAgent(formData);
    if (res?.error) {
      setError(res.error);
    }
    setLoading(false);
  }

  return (
    <Card 
      className="border-brutal rounded-none mt-8"
      style={{ backgroundColor: 'var(--acid-card)' }}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle style={{ color: 'var(--acid-text)' }}>Directorio de Agentes (Partners)</CardTitle>
          <CardDescription style={{ color: 'var(--acid-text-dim)' }}>
            Administra a tus afiliados y revisa su estado de comisiones.
          </CardDescription>
        </div>
        <form action={handlePromote} className="flex gap-2 items-start">
          <div className="flex flex-col gap-1">
            <Input 
              type="email" 
              name="email" 
              placeholder="correo@usuario.com"
              required
              className="bg-black/50 border-white/20 h-9 font-mono text-sm w-[250px]"
            />
            {error && <span className="text-red-500 text-[10px]">{error}</span>}
          </div>
          <Button type="submit" disabled={loading} size="sm" className="bg-lime-400 text-black hover:bg-lime-500 font-mono">
            {loading ? 'Ascendiendo...' : '+ Hacer Agente'}
          </Button>
        </form>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow 
              className="hover:bg-transparent"
              style={{ backgroundColor: 'var(--acid-bg)' }}
            >
              <TableHead className="uppercase text-[10px] tracking-widest" style={{ color: 'var(--acid-text-dim)' }}>Agente (Email)</TableHead>
              <TableHead className="uppercase text-[10px] tracking-widest" style={{ color: 'var(--acid-text-dim)' }}>Estado Stripe</TableHead>
              <TableHead className="uppercase text-[10px] tracking-widest" style={{ color: 'var(--acid-text-dim)' }}>Clientes Asignados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents?.map((agent) => (
              <TableRow 
                key={agent.id} 
                className="transition-colors border-b-0 hover:border-l-2 hover:bg-[var(--acid-bg)] hover:border-l-[var(--acid-neon)]"
                style={{ borderBottom: '1px solid var(--acid-border)' }}
              >
                <TableCell>
                  <div className="font-bold font-mono" style={{ color: 'var(--acid-text)' }}>{agent.email || 'Sin correo público'}</div>
                  <div className="text-[10px] opacity-50 font-mono">{agent.id}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className="border-brutal"
                    style={{ 
                      color: agent.stripe_onboarding_complete ? 'var(--acid-neon)' : 'var(--acid-danger)',
                      backgroundColor: 'var(--acid-bg)'
                    }}
                  >
                    {agent.stripe_onboarding_complete ? 'Pagos Activos' : 'Falta Onboarding'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xl font-bold font-mono" style={{ color: 'var(--acid-neon)' }}>
                    {agent.tenantCount}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {agents?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 font-mono" style={{ color: 'var(--acid-text-dim)' }}>
                  No hay agentes registrados aún. Usa el formulario de arriba para ascender a un usuario.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
