# -*- coding: utf-8 -*-
"""Vercel serverless girişi: Flask tətbiqini ixrac edir."""

import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from backend.app import app  # noqa: E402
