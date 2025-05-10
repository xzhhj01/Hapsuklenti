// Firebase Cloud Functions을 사용한 CRUD 기능 구현
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Firebase 초기화
admin.initializeApp();
const db = admin.firestore(); // Firestore 사용

const app = express();
app.use(cors({ origin: true }));

// 데이터 생성 (POST)
app.post('/api/items', async (req, res) => {
  try {
    const item = req.body;
    
    // 필수 필드 확인 (예: 'name'이 필수라고 가정)
    if (!item || !item.name) {
      return res.status(400).send({ error: '필수 데이터가 누락되었습니다.' });
    }
    
    // name으로 기존 문서 확인
    const nameQuery = await db.collection('items').where('name', '==', item.name).get();
    
    if (!nameQuery.empty) {
      return res.status(409).send({ error: '동일한 name을 가진 항목이 이미 존재합니다.' });
    }
    
    // Firestore에 데이터 추가
    const newDoc = await db.collection('items').add(item);
    
    // 생성된 문서 ID와 함께 성공 응답
    res.status(201).send({
      id: newDoc.id,
      ...item,
      message: '항목이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    res.status(500).send({ error: `항목 생성 중 오류가 발생했습니다: ${error.message}` });
  }
});

// 모든 데이터 조회 (GET)
app.get('/api/items', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    
    const items = [];
    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).send(items);
  } catch (error) {
    res.status(500).send({ error: `항목 조회 중 오류가 발생했습니다: ${error.message}` });
  }
});

// 특정 ID의 데이터 조회 (GET)
app.get('/api/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const doc = await db.collection('items').doc(itemId).get();
    
    if (!doc.exists) {
      return res.status(404).send({ error: '항목을 찾을 수 없습니다.' });
    }
    
    res.status(200).send({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    res.status(500).send({ error: `항목 조회 중 오류가 발생했습니다: ${error.message}` });
  }
});

// name으로 데이터 조회 (GET)
app.get('/api/items/name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const snapshot = await db.collection('items').where('name', '==', name).get();
    
    if (snapshot.empty) {
      return res.status(404).send({ error: '해당 name의 항목을 찾을 수 없습니다.' });
    }
    
    // name은 고유하다고 가정하고 첫 번째 문서 반환
    const doc = snapshot.docs[0];
    res.status(200).send({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    res.status(500).send({ error: `항목 조회 중 오류가 발생했습니다: ${error.message}` });
  }
});

// 데이터 수정 (PUT)
app.put('/api/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = req.body;
    
    // 해당 ID의 문서가 존재하는지 확인
    const doc = await db.collection('items').doc(itemId).get();
    if (!doc.exists) {
      return res.status(404).send({ error: '수정할 항목을 찾을 수 없습니다.' });
    }
    
    // 문서 업데이트
    await db.collection('items').doc(itemId).update(item);
    
    res.status(200).send({
      id: itemId,
      ...item,
      message: '항목이 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    res.status(500).send({ error: `항목 업데이트 중 오류가 발생했습니다: ${error.message}` });
  }
});

// name으로 데이터 수정 (PUT)
app.put('/api/items/name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const item = req.body;
    
    // name으로 문서 찾기
    const snapshot = await db.collection('items').where('name', '==', name).get();
    
    if (snapshot.empty) {
      return res.status(404).send({ error: '수정할 항목을 찾을 수 없습니다.' });
    }
    
    // name은 고유하다고 가정하고 첫 번째 문서 업데이트
    const doc = snapshot.docs[0];
    await db.collection('items').doc(doc.id).update(item);
    
    res.status(200).send({
      id: doc.id,
      ...item,
      message: '항목이 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    res.status(500).send({ error: `항목 업데이트 중 오류가 발생했습니다: ${error.message}` });
  }
});

// 데이터 삭제 (DELETE)
app.delete('/api/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // 해당 ID의 문서가 존재하는지 확인
    const doc = await db.collection('items').doc(itemId).get();
    if (!doc.exists) {
      return res.status(404).send({ error: '삭제할 항목을 찾을 수 없습니다.' });
    }
    
    // 문서 삭제
    await db.collection('items').doc(itemId).delete();
    
    res.status(200).send({
      id: itemId,
      message: '항목이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).send({ error: `항목 삭제 중 오류가 발생했습니다: ${error.message}` });
  }
});

// name으로 데이터 삭제 (DELETE)
app.delete('/api/items/name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    
    // name으로 문서 찾기
    const snapshot = await db.collection('items').where('name', '==', name).get();
    
    if (snapshot.empty) {
      return res.status(404).send({ error: '삭제할 항목을 찾을 수 없습니다.' });
    }
    
    // name은 고유하다고 가정하고 첫 번째 문서 삭제
    const doc = snapshot.docs[0];
    await db.collection('items').doc(doc.id).delete();
    
    res.status(200).send({
      id: doc.id,
      name: name,
      message: '항목이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).send({ error: `항목 삭제 중 오류가 발생했습니다: ${error.message}` });
  }
});

// 모든 API 경로를 Cloud Functions에 exports
exports.api = functions.https.onRequest(app);

// 라우팅 순서 문제 해결을 위한 참고 사항: 
// Express에서는 라우팅 순서가 중요합니다. 
// 위 코드에서 '/api/items/name/:name'와 '/api/items/:id' 같은 경로가 있을 경우
// '/api/items/name/:name'을 먼저 정의해야 합니다. 
// 그렇지 않으면 Express는 'name'을 id로 해석하게 됩니다.