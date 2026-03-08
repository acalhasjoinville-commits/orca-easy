export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          documento: string | null
          endereco: string | null
          id: string
          nome_razao_social: string
          numero: string | null
          tipo: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          documento?: string | null
          endereco?: string | null
          id?: string
          nome_razao_social: string
          numero?: string | null
          tipo?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          documento?: string | null
          endereco?: string | null
          id?: string
          nome_razao_social?: string
          numero?: string | null
          tipo?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      empresa: {
        Row: {
          bairro: string | null
          cidade: string | null
          cnpj_cpf: string | null
          cor_destaque: string
          cor_primaria: string
          created_at: string
          email_contato: string | null
          endereco: string | null
          estado: string | null
          id: string
          logo_url: string | null
          nome_fantasia: string
          numero: string | null
          razao_social: string | null
          slogan: string | null
          telefone_whatsapp: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          cnpj_cpf?: string | null
          cor_destaque?: string
          cor_primaria?: string
          created_at?: string
          email_contato?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome_fantasia?: string
          numero?: string | null
          razao_social?: string | null
          slogan?: string | null
          telefone_whatsapp?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          cnpj_cpf?: string | null
          cor_destaque?: string
          cor_primaria?: string
          created_at?: string
          email_contato?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome_fantasia?: string
          numero?: string | null
          razao_social?: string | null
          slogan?: string | null
          telefone_whatsapp?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      insumos: {
        Row: {
          created_at: string
          id: string
          nome_embalagem_compra: string
          nome_unidade_consumo: string
          preco_embalagem: number
          qtd_embalagem: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_embalagem_compra: string
          nome_unidade_consumo: string
          preco_embalagem?: number
          qtd_embalagem?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_embalagem_compra?: string
          nome_unidade_consumo?: string
          preco_embalagem?: number
          qtd_embalagem?: number
          updated_at?: string
        }
        Relationships: []
      }
      motor1: {
        Row: {
          created_at: string
          densidade: number
          id: string
          material: string
          preco_quilo: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          densidade?: number
          id?: string
          material: string
          preco_quilo?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          densidade?: number
          id?: string
          material?: string
          preco_quilo?: number
          updated_at?: string
        }
        Relationships: []
      }
      motor2: {
        Row: {
          corte: number
          created_at: string
          espessura: number
          id: string
          material: string
          preco_metro_linear: number
          updated_at: string
        }
        Insert: {
          corte?: number
          created_at?: string
          espessura?: number
          id?: string
          material: string
          preco_metro_linear?: number
          updated_at?: string
        }
        Update: {
          corte?: number
          created_at?: string
          espessura?: number
          id?: string
          material?: string
          preco_metro_linear?: number
          updated_at?: string
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          custo_total_obra: number
          data_criacao: string
          desconto: number
          descricao_geral: string | null
          formas_pagamento: string | null
          garantia: string | null
          id: string
          itens_servico: Json
          nome_cliente: string
          numero_orcamento: number
          status: string
          tempo_garantia: string | null
          updated_at: string
          validade: string | null
          valor_final: number
          valor_venda: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          custo_total_obra?: number
          data_criacao?: string
          desconto?: number
          descricao_geral?: string | null
          formas_pagamento?: string | null
          garantia?: string | null
          id?: string
          itens_servico?: Json
          nome_cliente: string
          numero_orcamento: number
          status?: string
          tempo_garantia?: string | null
          updated_at?: string
          validade?: string | null
          valor_final?: number
          valor_venda?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          custo_total_obra?: number
          data_criacao?: string
          desconto?: number
          descricao_geral?: string | null
          formas_pagamento?: string | null
          garantia?: string | null
          id?: string
          itens_servico?: Json
          nome_cliente?: string
          numero_orcamento?: number
          status?: string
          tempo_garantia?: string | null
          updated_at?: string
          validade?: string | null
          valor_final?: number
          valor_venda?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      politicas_comerciais: {
        Row: {
          created_at: string
          formas_pagamento: string | null
          garantia: string | null
          id: string
          nome_politica: string
          tempo_garantia: string | null
          updated_at: string
          validade_dias: number
        }
        Insert: {
          created_at?: string
          formas_pagamento?: string | null
          garantia?: string | null
          id?: string
          nome_politica: string
          tempo_garantia?: string | null
          updated_at?: string
          validade_dias?: number
        }
        Update: {
          created_at?: string
          formas_pagamento?: string | null
          garantia?: string | null
          id?: string
          nome_politica?: string
          tempo_garantia?: string | null
          updated_at?: string
          validade_dias?: number
        }
        Relationships: []
      }
      regras_calculo: {
        Row: {
          created_at: string
          id: string
          itens_regra: Json
          nome_regra: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          itens_regra?: Json
          nome_regra: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          itens_regra?: Json
          nome_regra?: string
          updated_at?: string
        }
        Relationships: []
      }
      servicos_catalogo: {
        Row: {
          corte_padrao: number
          created_at: string
          dificuldade_dificil: number
          dificuldade_facil: number
          dificuldade_media: number
          espessura_padrao: number
          id: string
          material_padrao: string
          motor_padrao: string
          nome_servico: string
          regra_id: string
          updated_at: string
        }
        Insert: {
          corte_padrao?: number
          created_at?: string
          dificuldade_dificil?: number
          dificuldade_facil?: number
          dificuldade_media?: number
          espessura_padrao?: number
          id?: string
          material_padrao?: string
          motor_padrao?: string
          nome_servico: string
          regra_id?: string
          updated_at?: string
        }
        Update: {
          corte_padrao?: number
          created_at?: string
          dificuldade_dificil?: number
          dificuldade_facil?: number
          dificuldade_media?: number
          espessura_padrao?: number
          id?: string
          material_padrao?: string
          motor_padrao?: string
          nome_servico?: string
          regra_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
