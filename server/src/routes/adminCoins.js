const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const STORE_PATH = path.join(__dirname, '../../admin-coins.json');

const readStore = () => {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
};

const writeStore = (data) => {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// GET: 전체 목록
router.get('/', (req, res) => {
  const data = readStore();
  res.json({ items: data });
});

// PUT: 전체 덮어쓰기(관리자에서 확정 반영 시 호출)
router.put('/', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  writeStore(items);
  res.json({ ok: true });
});

module.exports = router;


