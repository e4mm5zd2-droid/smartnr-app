from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import os
import json
from openai import OpenAI

router = APIRouter()

# xAI Grok APIクライアント
xai_client = OpenAI(
    api_key=os.getenv("XAI_API_KEY"),
    base_url=os.getenv("XAI_BASE_URL", "https://api.x.ai/v1")
)

SYSTEM_PROMPT_TEXT = """あなたはナイトワークのスカウトアシスタントです。
入力されたテキストからキャスト候補の情報を抽出してください。

抽出する項目（見つからない場合はnull）:
- genji_name: 源氏名（芸名。なければ名前のひらがな/カタカナ部分）
- real_name_initial: 本名（フルネームがあればイニシャル化: "田中まり" → "T.M"）
- age: 年齢（数字のみ）
- height: 身長cm（数字のみ）
- phone: 電話番号（ハイフンあり形式に正規化）
- line_id: LINE ID
- experience: 経験（"未経験" or "経験あり" or 具体的な経験内容）
- preferred_area: 希望エリア
- looks_tags: 外見タグの配列（"清楚系", "ギャル系", "大人系", "可愛い系", "クール系" 等）
- availability: 勤務希望（"週3", "フル" 等）
- notes: その他の情報（上記に分類できないもの全て）

回答はJSON形式のみ。マークダウンのバッククォート不要。余計なテキスト不要。
テキストが乱雑でも可能な限り推測して抽出すること。
"""

SYSTEM_PROMPT_OCR = """この画像はLINEのトーク画面、メモアプリ、または手書きメモのスクリーンショットです。
画像内のテキストを全て読み取り、そこからキャスト候補の情報を抽出してください。

抽出する項目（見つからない場合はnull）:
- genji_name: 源氏名（芸名）
- real_name_initial: 本名（イニシャル化）
- age: 年齢
- height: 身長cm
- phone: 電話番号
- line_id: LINE ID
- experience: 経験
- preferred_area: 希望エリア
- looks_tags: 外見タグの配列
- availability: 勤務希望
- notes: その他の情報

画像が不鮮明でも可能な限り推測すること。
回答はJSON形式のみ。
"""


class TextParseRequest(BaseModel):
    raw_text: str


class ParsedCastInfo(BaseModel):
    genji_name: Optional[str] = None
    real_name_initial: Optional[str] = None
    age: Optional[int] = None
    height: Optional[int] = None
    phone: Optional[str] = None
    line_id: Optional[str] = None
    experience: Optional[str] = None
    preferred_area: Optional[str] = None
    looks_tags: Optional[List[str]] = None
    availability: Optional[str] = None
    notes: Optional[str] = None


class TextParseResponse(BaseModel):
    parsed: ParsedCastInfo
    confidence: float
    raw_text: str


class ImageParseResponse(BaseModel):
    parsed: ParsedCastInfo
    confidence: float
    ocr_text: str


@router.post("/text", response_model=TextParseResponse)
async def parse_text(request: TextParseRequest):
    """
    テキストからキャスト情報を抽出
    """
    if not request.raw_text or request.raw_text.strip() == "":
        raise HTTPException(status_code=400, detail="raw_text is required")
    
    try:
        # xAI Grok APIでテキスト解析
        completion = xai_client.chat.completions.create(
            model="grok-3-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_TEXT},
                {"role": "user", "content": f"以下のテキストから情報を抽出してください:\n\n{request.raw_text}"}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # JSONパース（マークダウンのバッククォートを除去）
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        parsed_data = json.loads(response_text)
        
        # 信頼度計算（抽出できたフィールドの割合）
        total_fields = 11
        extracted_fields = sum(1 for v in parsed_data.values() if v is not None and v != "")
        confidence = round(extracted_fields / total_fields, 2)
        
        return TextParseResponse(
            parsed=ParsedCastInfo(**parsed_data),
            confidence=confidence,
            raw_text=request.raw_text
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI response parsing failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Text parsing failed: {str(e)}"
        )


@router.post("/image", response_model=ImageParseResponse)
async def parse_image(image: UploadFile = File(...)):
    """
    スクショ画像からキャスト情報を抽出（OCR）
    """
    # ファイルサイズチェック（5MB）
    contents = await image.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="画像サイズは5MB以下にしてください")
    
    # ファイル形式チェック
    allowed_types = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if image.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="PNG, JPG, WEBPのみ対応しています")
    
    try:
        import base64
        
        # base64エンコード
        base64_image = base64.b64encode(contents).decode('utf-8')
        image_url = f"data:{image.content_type};base64,{base64_image}"
        
        # xAI Grok Vision APIでOCR
        completion = xai_client.chat.completions.create(
            model="grok-3-mini",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT_OCR
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        },
                        {
                            "type": "text",
                            "text": "この画像からキャスト情報を抽出してください。"
                        }
                    ]
                }
            ],
            temperature=0.3,
            max_tokens=1500
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # JSONパース
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        parsed_data = json.loads(response_text)
        
        # 信頼度計算
        total_fields = 11
        extracted_fields = sum(1 for v in parsed_data.values() if v is not None and v != "")
        confidence = round(extracted_fields / total_fields, 2)
        
        # OCRで読み取ったテキストを推定（実際にはAIが抽出した情報から再構成）
        ocr_text = f"Name: {parsed_data.get('genji_name', 'N/A')}\nAge: {parsed_data.get('age', 'N/A')}\nPhone: {parsed_data.get('phone', 'N/A')}"
        
        return ImageParseResponse(
            parsed=ParsedCastInfo(**parsed_data),
            confidence=confidence,
            ocr_text=ocr_text
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI response parsing failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Image parsing failed: {str(e)}"
        )
