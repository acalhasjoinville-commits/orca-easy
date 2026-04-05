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
          empresa_id: string
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
          empresa_id: string
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
          empresa_id?: string
          endereco?: string | null
          id?: string
          nome_razao_social?: string
          numero?: string | null
          tipo?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa: {
        Row: {
          bairro: string | null
          cidade: string | null
          cnpj_cpf: string | null
          cor_destaque: string
          cor_primaria: string | null
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
          status: string
          telefone_whatsapp: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          cnpj_cpf?: string | null
          cor_destaque?: string
          cor_primaria?: string | null
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
          status?: string
          telefone_whatsapp?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          cnpj_cpf?: string | null
          cor_destaque?: string
          cor_primaria?: string | null
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
          status?: string
          telefone_whatsapp?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      empresa_orcamento_counters: {
        Row: {
          empresa_id: string
          ultimo_numero: number
        }
        Insert: {
          empresa_id: string
          ultimo_numero?: number
        }
        Update: {
          empresa_id?: string
          ultimo_numero?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_orcamento_counters_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          nome_embalagem_compra: string
          nome_unidade_consumo: string
          preco_embalagem: number
          qtd_embalagem: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          nome_embalagem_compra: string
          nome_unidade_consumo: string
          preco_embalagem?: number
          qtd_embalagem?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          nome_embalagem_compra?: string
          nome_unidade_consumo?: string
          preco_embalagem?: number
          qtd_embalagem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insumos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string | null
          email: string
          empresa_id: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          empresa_id: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          empresa_id?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos_financeiros: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string
          empresa_id: string
          id: string
          observacao: string | null
          origem: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          data?: string
          descricao: string
          empresa_id: string
          id?: string
          observacao?: string | null
          origem?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          empresa_id?: string
          id?: string
          observacao?: string | null
          origem?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_financeiros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      motor1: {
        Row: {
          created_at: string
          densidade: number
          empresa_id: string
          id: string
          material: string
          preco_quilo: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          densidade?: number
          empresa_id: string
          id?: string
          material: string
          preco_quilo?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          densidade?: number
          empresa_id?: string
          id?: string
          material?: string
          preco_quilo?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "motor1_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      motor2: {
        Row: {
          corte: number
          created_at: string
          empresa_id: string
          espessura: number
          id: string
          material: string
          preco_metro_linear: number
          updated_at: string
        }
        Insert: {
          corte?: number
          created_at?: string
          empresa_id: string
          espessura?: number
          id?: string
          material: string
          preco_metro_linear?: number
          updated_at?: string
        }
        Update: {
          corte?: number
          created_at?: string
          empresa_id?: string
          espessura?: number
          id?: string
          material?: string
          preco_metro_linear?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "motor2_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_followup_logs: {
        Row: {
          created_at: string
          descricao: string
          empresa_id: string
          id: string
          orcamento_id: string
          tipo: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          descricao?: string
          empresa_id: string
          id?: string
          orcamento_id: string
          tipo: string
          user_id: string
          user_name?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          empresa_id?: string
          id?: string
          orcamento_id?: string
          tipo?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_followup_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_followup_logs_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_followups: {
        Row: {
          created_at: string
          data_retorno: string | null
          empresa_id: string
          id: string
          observacoes: string
          orcamento_id: string
          proxima_acao: string
          responsavel_id: string | null
          responsavel_nome: string
          status_followup: string
          ultima_interacao_em: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_retorno?: string | null
          empresa_id: string
          id?: string
          observacoes?: string
          orcamento_id: string
          proxima_acao?: string
          responsavel_id?: string | null
          responsavel_nome?: string
          status_followup?: string
          ultima_interacao_em?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_retorno?: string | null
          empresa_id?: string
          id?: string
          observacoes?: string
          orcamento_id?: string
          proxima_acao?: string
          responsavel_id?: string | null
          responsavel_nome?: string
          status_followup?: string
          ultima_interacao_em?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_followups_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_followups_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: true
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          custo_total_obra: number
          data_cancelamento: string | null
          data_criacao: string
          data_execucao: string | null
          data_faturamento: string | null
          data_pagamento: string | null
          data_prevista: string | null
          desconto: number
          descricao_geral: string | null
          empresa_id: string
          formas_pagamento: string | null
          formas_pagamento_snapshot: string | null
          garantia: string | null
          garantia_snapshot: string | null
          id: string
          itens_servico: Json
          motor_type: string | null
          nome_cliente: string
          numero_orcamento: number
          politica_comercial_id: string | null
          politica_nome_snapshot: string | null
          status: string
          tempo_garantia: string | null
          tempo_garantia_snapshot: string | null
          termo_recebimento_os_snapshot: string | null
          updated_at: string
          validade: string | null
          validade_snapshot: string | null
          valor_final: number
          valor_venda: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          custo_total_obra?: number
          data_cancelamento?: string | null
          data_criacao?: string
          data_execucao?: string | null
          data_faturamento?: string | null
          data_pagamento?: string | null
          data_prevista?: string | null
          desconto?: number
          descricao_geral?: string | null
          empresa_id: string
          formas_pagamento?: string | null
          formas_pagamento_snapshot?: string | null
          garantia?: string | null
          garantia_snapshot?: string | null
          id?: string
          itens_servico?: Json
          motor_type?: string | null
          nome_cliente: string
          numero_orcamento: number
          politica_comercial_id?: string | null
          politica_nome_snapshot?: string | null
          status?: string
          tempo_garantia?: string | null
          tempo_garantia_snapshot?: string | null
          termo_recebimento_os_snapshot?: string | null
          updated_at?: string
          validade?: string | null
          validade_snapshot?: string | null
          valor_final?: number
          valor_venda?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          custo_total_obra?: number
          data_cancelamento?: string | null
          data_criacao?: string
          data_execucao?: string | null
          data_faturamento?: string | null
          data_pagamento?: string | null
          data_prevista?: string | null
          desconto?: number
          descricao_geral?: string | null
          empresa_id?: string
          formas_pagamento?: string | null
          formas_pagamento_snapshot?: string | null
          garantia?: string | null
          garantia_snapshot?: string | null
          id?: string
          itens_servico?: Json
          motor_type?: string | null
          nome_cliente?: string
          numero_orcamento?: number
          politica_comercial_id?: string | null
          politica_nome_snapshot?: string | null
          status?: string
          tempo_garantia?: string | null
          tempo_garantia_snapshot?: string | null
          termo_recebimento_os_snapshot?: string | null
          updated_at?: string
          validade?: string | null
          validade_snapshot?: string | null
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
          {
            foreignKeyName: "orcamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_politica_comercial_id_fkey"
            columns: ["politica_comercial_id"]
            isOneToOne: false
            referencedRelation: "politicas_comerciais"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          primary_color: string
          updated_at: string
        }
        Insert: {
          id?: string
          primary_color?: string
          updated_at?: string
        }
        Update: {
          id?: string
          primary_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      politicas_comerciais: {
        Row: {
          created_at: string
          empresa_id: string
          formas_pagamento: string | null
          garantia: string | null
          id: string
          nome_politica: string
          tempo_garantia: string | null
          termo_recebimento_os: string | null
          updated_at: string
          validade_dias: number
        }
        Insert: {
          created_at?: string
          empresa_id: string
          formas_pagamento?: string | null
          garantia?: string | null
          id?: string
          nome_politica: string
          tempo_garantia?: string | null
          termo_recebimento_os?: string | null
          updated_at?: string
          validade_dias?: number
        }
        Update: {
          created_at?: string
          empresa_id?: string
          formas_pagamento?: string | null
          garantia?: string | null
          id?: string
          nome_politica?: string
          tempo_garantia?: string | null
          termo_recebimento_os?: string | null
          updated_at?: string
          validade_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: "politicas_comerciais_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          empresa_id: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_calculo: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          itens_regra: Json
          nome_regra: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          itens_regra?: Json
          nome_regra: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          itens_regra?: Json
          nome_regra?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regras_calculo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_control: {
        Row: {
          empresa_id: string
          id: string
          seeded_at: string
          table_name: string
        }
        Insert: {
          empresa_id: string
          id?: string
          seeded_at?: string
          table_name: string
        }
        Update: {
          empresa_id?: string
          id?: string
          seeded_at?: string
          table_name?: string
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
          empresa_id: string
          espessura_padrao: number
          id: string
          material_padrao: string
          motor_type: string
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
          empresa_id: string
          espessura_padrao?: number
          id?: string
          material_padrao?: string
          motor_type?: string
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
          empresa_id?: string
          espessura_padrao?: number
          id?: string
          material_padrao?: string
          motor_type?: string
          nome_servico?: string
          regra_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_catalogo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          empresa_id: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          empresa_id: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          empresa_id?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_seed: {
        Args: { _empresa_id: string; _table_name: string }
        Returns: boolean
      }
      get_empresa_status: { Args: { _user_id?: string }; Returns: string }
      get_user_empresa_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id?: string }; Returns: boolean }
      next_orcamento_number: { Args: never; Returns: number }
      sa_approve_user: {
        Args: {
          _empresa_id: string
          _role?: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      sa_create_empresa: {
        Args: {
          _cnpj_cpf?: string
          _email_contato?: string
          _invite_email?: string
          _invite_role?: Database["public"]["Enums"]["app_role"]
          _nome_fantasia: string
          _razao_social?: string
          _telefone?: string
        }
        Returns: string
      }
      sa_create_invite: {
        Args: {
          _email: string
          _empresa_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      sa_dashboard_stats: { Args: never; Returns: Json }
      sa_delete_user_role: {
        Args: { _empresa_id: string; _user_id: string }
        Returns: undefined
      }
      sa_get_empresa_detail: { Args: { _empresa_id: string }; Returns: Json }
      sa_get_platform_settings: { Args: never; Returns: Json }
      sa_list_all_invites: { Args: never; Returns: Json }
      sa_list_all_users: { Args: never; Returns: Json }
      sa_list_audit_log: { Args: { _limit?: number }; Returns: Json }
      sa_list_empresas: { Args: never; Returns: Json }
      sa_revoke_invite: { Args: { _invite_id: string }; Returns: undefined }
      sa_update_empresa: {
        Args: {
          _bairro?: string
          _cidade?: string
          _cnpj_cpf?: string
          _email_contato?: string
          _empresa_id: string
          _endereco?: string
          _estado?: string
          _nome_fantasia: string
          _numero?: string
          _razao_social?: string
          _slogan?: string
          _telefone_whatsapp?: string
        }
        Returns: undefined
      }
      sa_update_empresa_status: {
        Args: { _empresa_id: string; _new_status: string }
        Returns: undefined
      }
      sa_update_platform_settings: {
        Args: { _primary_color: string }
        Returns: undefined
      }
      sa_upsert_user_role: {
        Args: {
          _empresa_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "vendedor" | "financeiro"
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
    Enums: {
      app_role: ["admin", "vendedor", "financeiro"],
    },
  },
} as const
