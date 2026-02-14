const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FaceAnalysisResult {
  age_range: string;
  tags: string[];
  hairstyle: string;
}

export interface Shop {
  id: number;
  name: string;
  area: string;
  system_type: string;
  hourly_wage_min: number;
  hourly_wage_max: number;
  match_score: number;
  reason: string;
}

export interface Cast {
  id: number;
  scout_id?: number;
  genji_name: string;
  real_name_initial?: string;
  age: number;
  phone: string;
  line_id?: string;
  looks_tags?: string[];
  status: string;
  photos_url?: string;
  notes?: string;
  created_at: string;
}

export const analyzeFace = async (file: File): Promise<FaceAnalysisResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/analyze-face`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('画像分析に失敗しました');
  }

  return response.json();
};

export const getShopRecommendations = async (
  age: number,
  tags: string[]
): Promise<Shop[]> => {
  const tagsParam = tags.join(',');
  const response = await fetch(
    `${API_BASE_URL}/api/shops/recommend?age=${age}&tags=${tagsParam}&limit=5`
  );

  if (!response.ok) {
    throw new Error('店舗レコメンド取得に失敗しました');
  }

  return response.json();
};

export const createCast = async (castData: Partial<Cast>): Promise<Cast> => {
  const response = await fetch(`${API_BASE_URL}/api/job-seekers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(castData),
  });

  if (!response.ok) {
    throw new Error('キャスト登録に失敗しました');
  }

  return response.json();
};

export const getCasts = async (): Promise<Cast[]> => {
  const response = await fetch(`${API_BASE_URL}/api/job-seekers`);

  if (!response.ok) {
    throw new Error('キャスト一覧取得に失敗しました');
  }

  return response.json();
};

export const getStores = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/api/stores`);

  if (!response.ok) {
    throw new Error('店舗一覧取得に失敗しました');
  }

  return response.json();
};
