export type Faq = {
  id: number;
  question: string;
  answer: string;
  order_index: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type City = {
  id: number;
  slug: string;
  name_imya: string;
  name_roditelny: string | null;
  name_datelny: string | null;
  name_vinitelny: string | null;
  name_tvoritelny: string | null;
  name_predlozhny: string | null;
  domain_prefix: string | null;
  contact_address: string | null;
  contact_hours: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_legal_email: string | null;
  contact_yandex_map_url: string | null;
  contact_gallery: string | null;
  is_active: number;
  created_at: string;
};
