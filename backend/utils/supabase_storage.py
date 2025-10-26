import os
from supabase import create_client
from dotenv import load_dotenv
from uuid import uuid4

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_to_supabase(file, filename: str):
    """
    Upload a file (PDF/TXT) to Supabase Storage and return its public URL.
    Works for public buckets only.
    """
    try:
        unique_name = f"{uuid4()}_{filename}"
        file_bytes = file.read()

        # Upload the file into the specified bucket root
        res = supabase.storage.from_(SUPABASE_BUCKET).upload(unique_name, file_bytes)

        # Verify upload success
        if hasattr(res, "error") and res.error:
            raise Exception(f"Supabase upload failed: {res.error}")

        # Build correct public URL manually
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{unique_name}"
        print(f"✅ Uploaded to Supabase: {public_url}")
        return public_url

    except Exception as e:
        print(f"❌ Error uploading file to Supabase: {e}")
        raise e
