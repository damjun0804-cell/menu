import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

// 미르의 메뉴판 기본 데이터 세트
const initialMenus = [
  { title: "아잉", price: 1, category: "일반", description: "" },
  { title: "힝구", price: 5, category: "일반", description: "" },
  { title: "룰렛", price: 20, category: "일반", description: "" },
  { title: "멍멍체 5분", price: 30, category: "일반", description: "" },
  { title: "원하는 호칭 방종까지", price: 40, category: "일반", description: "" },
  { title: "원하는 말 읽어주기", price: 50, category: "일반", description: "" },
  { title: "팬보드", price: 100, category: "일반", description: "" },
  { title: "리방", price: 300, category: "일반", description: "" },
  { title: "커플프사", price: 500, category: "일반", description: "" }
];

export default function App() {
  const [menus, setMenus] = useState([]);
  const [histories, setHistories] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // 1. 신규 아이템 등록 폼 상태
  const [itemTitle, setItemTitle] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("일반");
  const [itemDescription, setItemDescription] = useState("");

  // 2. 히스토리 등록 폼 상태
  const [historyType, setHistoryType] = useState("PURCHASE");
  const [historyItemName, setHistoryItemName] = useState("");
  const [historyAmount, setHistoryAmount] = useState("");
  const [historyUserName, setHistoryUserName] = useState("");

  useEffect(() => {
    // Firestore 메뉴 실시간 감지
    const unsubscribeMenu = onSnapshot(collection(db, "menus"), (snapshot) => {
      const menuData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMenus(menuData);
    });

    // Firestore 히스토리 실시간 감지 (최신순)
    const historyQuery = query(collection(db, "histories"), orderBy("createdAt", "desc"));
    const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
      const historyData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHistories(historyData);
    });

    return () => {
      unsubscribeMenu();
      unsubscribeHistory();
    };
  }, []);

  // [기능] 미르의 메뉴판 초기 데이터 일괄 등록
  const handleUploadInitialMenus = async () => {
    if (!window.confirm("미르의 메뉴판 기본 9개 항목을 DB에 추가하시겠습니까?")) return;
    try {
      for (const item of initialMenus) {
        await addDoc(collection(db, "menus"), {
          ...item,
          createdAt: serverTimestamp(),
        });
      }
      alert("미르의 메뉴판 항목 등록이 완료되었습니다.");
    } catch (error) {
      console.error("데이터 등록 중 오류 발생:", error);
      alert("등록에 실패했습니다.");
    }
  };

  // [기능 1] 개별 아이템 추가
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemTitle || !itemPrice) return;

    await addDoc(collection(db, "menus"), {
      title: itemTitle,
      price: Number(itemPrice),
      category: itemCategory,
      description: itemDescription,
      createdAt: serverTimestamp(),
    });

    setItemTitle("");
    setItemPrice("");
    setItemDescription("");
    alert("새 항목이 등록되었습니다.");
  };

  // [기능 2] 사용/구매 내역 추가
  const handleAddHistory = async (e) => {
    e.preventDefault();
    if (!historyItemName || !historyAmount) return;

    await addDoc(collection(db, "histories"), {
      type: historyType,
      itemName: historyItemName,
      amount: Number(historyAmount),
      userName: historyUserName || "익명",
      createdAt: serverTimestamp(),
    });

    setHistoryItemName("");
    setHistoryAmount("");
    setHistoryUserName("");
    alert("기록이 추가되었습니다.");
  };

  const reactions = menus.filter((item) => item.category === "리액션");
  const regularMenus = menus.filter((item) => item.category !== "리액션");

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>˚₊‧꒰ა 미르의 메뉴판 ໒꒱ ‧₊˚</h1>

      {/* 상단 버튼 영역 */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
        <button 
          onClick={handleUploadInitialMenus}
          style={{ padding: "10px 15px", cursor: "pointer", backgroundColor: "#FF9800", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          🎁 기본 메뉴판 한번에 등록하기
        </button>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ padding: "10px 15px", cursor: "pointer", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          {showAddForm ? "➕ 폼 닫기" : "➕ 메뉴/기록 직접 추가"}
        </button>
        <button 
          onClick={() => setShowHistoryModal(true)}
          style={{ padding: "10px 15px", cursor: "pointer", backgroundColor: "#2196F3", color: "#fff", border: "none", borderRadius: "4px" }}
        >
          📜 히스토리 보기
        </button>
      </div>

      {/* 수동 추가 폼 영역 */}
      {showAddForm && (
        <div style={{ border: "2px solid #ddd", padding: "15px", borderRadius: "8px", marginBottom: "30px", backgroundColor: "#f9f9f9" }}>
          <h3>➕ 신규 메뉴 / 리액션 추가</h3>
          <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            <input 
              type="text" 
              placeholder="항목명" 
              value={itemTitle} 
              onChange={(e) => setItemTitle(e.target.value)} 
              required 
            />
            <input 
              type="number" 
              placeholder="개수 (가격)" 
              value={itemPrice} 
              onChange={(e) => setItemPrice(e.target.value)} 
              required 
            />
            <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
              <option value="일반">일반 메뉴</option>
              <option value="리액션">리액션 목록</option>
            </select>
            <input 
              type="text" 
              placeholder="설명 (선택사항)" 
              value={itemDescription} 
              onChange={(e) => setItemDescription(e.target.value)} 
            />
            <button type="submit" style={{ padding: "8px", cursor: "pointer" }}>메뉴 등록</button>
          </form>

          <hr style={{ margin: "20px 0" }} />

          <h3>📝 사용 / 구매 내역 직접 기록</h3>
          <form onSubmit={handleAddHistory} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <select value={historyType} onChange={(e) => setHistoryType(e.target.value)}>
              <option value="PURCHASE">구매 (적립)</option>
              <option value="USE">사용</option>
            </select>
            <input 
              type="text" 
              placeholder="아이템명 (예: 아잉)" 
              value={historyItemName} 
              onChange={(e) => setHistoryItemName(e.target.value)} 
              required 
            />
            <input 
              type="number" 
              placeholder="수량" 
              value={historyAmount} 
              onChange={(e) => setHistoryAmount(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              placeholder="닉네임 (미입력 시 익명)" 
              value={historyUserName} 
              onChange={(e) => setHistoryUserName(e.target.value)} 
            />
            <button type="submit" style={{ padding: "8px", cursor: "pointer" }}>기록 등록</button>
          </form>
        </div>
      )}

      {/* 1. 메뉴판 */}
      <section style={{ marginBottom: "30px" }}>
        <h2>🥄 메뉴판</h2>
        {regularMenus.length === 0 ? <p>등록된 메뉴가 없습니다.</p> : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {regularMenus.map((item) => (
              <li key={item.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0", fontSize: "1.1rem" }}>
                <span>🥄 {item.price}◦<strong>{item.title}</strong></span>
                {item.description && <p style={{ color: "#666", fontSize: "0.9rem", margin: "5px 0 0 0" }}>{item.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. 킵해둔 리액션 목록 */}
      <section>
        <h2>✨ 킵해둔 리액션 목록</h2>
        {reactions.length === 0 ? <p>등록된 리액션이 없습니다.</p> : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reactions.map((item) => (
              <li key={item.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0", fontSize: "1.1rem" }}>
                <span>✨ <strong>{item.title}</strong> — {item.price}개</span>
                {item.description && <p style={{ color: "#666", fontSize: "0.9rem", margin: "5px 0 0 0" }}>{item.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. 히스토리 모달 */}
      {showHistoryModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "500px", width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>📅 사용 및 구매 기록</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ cursor: "pointer" }}>닫기</button>
            </div>
            
            <ul style={{ paddingLeft: "20px", marginTop: "15px" }}>
              {histories.map((h) => (
                <li key={h.id} style={{ marginBottom: "10px" }}>
                  <span style={{ color: h.type === "PURCHASE" ? "blue" : "red", fontWeight: "bold" }}>
                    [{h.type === "PURCHASE" ? "구매" : "사용"}]
                  </span>{" "}
                  <strong>{h.itemName}</strong> ({h.amount}개) - {h.userName || "익명"}
                  <br />
                  <small style={{ color: "#888" }}>
                    {h.createdAt?.toDate ? h.createdAt.toDate().toLocaleString("ko-KR") : "방금 전"}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
