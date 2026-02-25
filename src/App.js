import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
const GROUPS = ["Koalas", "Butterflies", "Hawks"];

const COLORS = {
  Koalas:      { h: "#1F4E79", l: "#D6E4F0" },
  Butterflies: { h: "#7B3F00", l: "#FEF0D9" },
  Hawks:       { h: "#1B5E20", l: "#E8F5E9" },
};

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

// 🔧 PROFESORES Y PINES
const TEACHERS = [
  { id: 1, name: "Yosmi",    pin: "1234", role: "teacher" },
  { id: 2, name: "Juan",     pin: "2345", role: "teacher" },
  { id: 3, name: "Laura",    pin: "3456", role: "teacher" },
  { id: 99, name: "Admin",   pin: "0000", role: "admin"   },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d + "T12:00:00").toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

const todayStr = () => new Date().toISOString().split("T")[0];

// ── STYLES ────────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "13px 16px", borderRadius: 12,
  border: "2px solid #e8e8e8", fontSize: 15,
  fontFamily: "'DM Sans',sans-serif", color: "#333",
  background: "#fafafa", outline: "none", boxSizing: "border-box",
};
const labelSt = {
  display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700,
  color: "#999", fontFamily: "'DM Mono',monospace", letterSpacing: 1.5,
};
const card = {
  background: "#fff", borderRadius: 20, padding: 20,
  boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #f0f0f0",
};

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const s = { width: size, height: size };
  const icons = {
    plus:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    list:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>,
    chart:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}><rect x="2" y="12" width="4" height="10"/><rect x="9" y="7" width="4" height="15"/><rect x="16" y="3" width="4" height="19"/></svg>,
    check:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} style={s}><polyline points="20 6 9 17 4 12"/></svg>,
    trash:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    logout:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    users:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    shield:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    spin:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{...s, animation:"spin 1s linear infinite"}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    edit:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  };
  return icons[name] || null;
};

// ── PIN LOGIN ─────────────────────────────────────────────────────────────────
function PinLogin({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) {
      setTimeout(() => {
        const teacher = TEACHERS.find(t => t.pin === next);
        if (teacher) {
          onLogin(teacher);
        } else {
          setShake(true);
          setError("PIN incorrecto");
          setPin("");
          setTimeout(() => setShake(false), 500);
        }
      }, 200);
    }
  };

  const handleDel = () => setPin(p => p.slice(0, -1));

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)",
      padding: 24,
    }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>

      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display',serif" }}>
          Control Callan
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif", marginTop: 6 }}>
          Ingresá tu PIN
        </div>
      </div>

      <div style={{
        display: "flex", gap: 16, marginBottom: 32,
        animation: shake ? "shake 0.4s ease" : "none",
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: "50%",
            background: i < pin.length ? "#fff" : "rgba(255,255,255,0.2)",
            transition: "background 0.15s",
            boxShadow: i < pin.length ? "0 0 12px rgba(255,255,255,0.6)" : "none",
          }}/>
        ))}
      </div>

      {error && (
        <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 20, fontFamily: "'DM Sans',sans-serif" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: 240 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d, i) => (
          <button key={i} onClick={() => d === "⌫" ? handleDel() : d !== "" ? handleDigit(String(d)) : null}
            disabled={d === ""}
            style={{
              padding: "18px 0", borderRadius: 16, border: "none",
              background: d === "" ? "transparent" : d === "⌫" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.12)",
              color: "#fff", fontSize: d === "⌫" ? 20 : 22, fontWeight: 600,
              fontFamily: "'DM Sans',sans-serif", cursor: d === "" ? "default" : "pointer",
              transition: "background 0.15s",
              backdropFilter: "blur(4px)",
            }}>{d}</button>
        ))}
      </div>
    </div>
  );
}

// ── FORM VIEW (teacher) ───────────────────────────────────────────────────────
function FormView({ teacher, onSave }) {
  const [date, setDate]       = useState(todayStr());
  const [group, setGroup]     = useState(GROUPS[0]);
  const [newWork, setNewWork] = useState("");
  const [reading, setReading] = useState("");
  const [dictation, setDictation] = useState("");
  const [activity, setActivity]   = useState("");
  const [status, setStatus]   = useState("idle");

  const handleSubmit = async () => {
    if (!newWork && !reading && !dictation && !activity) return;
    setStatus("saving");
    const { error } = await supabase.from("classes").insert({
      date, group,
      new_work: newWork, reading, dictation, activity,
      teacher_id: teacher.id,
      teacher_name: teacher.name,
    });
    if (error) { setStatus("error"); return; }
    setStatus("saved");
    setNewWork(""); setReading(""); setDictation(""); setActivity("");
    onSave();
    setTimeout(() => setStatus("idle"), 2000);
  };

  const col = COLORS[group] || { h: "#333", l: "#eee" };

  return (
    <div style={{ paddingBottom: 88 }}>
      <div style={{
        background: `linear-gradient(135deg, ${col.h}, ${col.h}cc)`,
        padding: "28px 20px 24px",
        borderRadius: "0 0 28px 28px",
        marginBottom: 24,
        boxShadow: `0 8px 32px ${col.h}44`,
      }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 4 }}>
          NUEVA CLASE • {teacher.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display',serif" }}>
          Registrar clase
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelSt}>📅 FECHA</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ ...inputStyle, fontFamily: "'DM Mono',monospace" }} />
        </div>

        <div>
          <label style={labelSt}>👥 GRUPO</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GROUPS.map(g => {
              const gc = COLORS[g] || { h: "#333", l: "#eee" };
              return (
                <button key={g} onClick={() => setGroup(g)} style={{
                  flex: "1 1 auto", padding: "11px 8px", borderRadius: 14,
                  border: group === g ? `2.5px solid ${gc.h}` : "2px solid #e0e0e0",
                  background: group === g ? gc.l : "#fafafa",
                  color: group === g ? gc.h : "#999",
                  fontWeight: group === g ? 700 : 500,
                  fontSize: 13, cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
                }}>{g}</button>
              );
            })}
          </div>
        </div>

        {[
          { label: "📖 NEW WORK",  val: newWork,   set: setNewWork,   ph: "Ej: Lección 47..." },
          { label: "📚 READING",   val: reading,   set: setReading,   ph: "Ej: 42" },
          { label: "✍️ DICTATION", val: dictation, set: setDictation, ph: "Ej: 22" },
          { label: "🎯 ACTIVIDAD", val: activity,  set: setActivity,  ph: "Ej: Oral Reader, Test..." },
        ].map(({ label, val, set, ph }) => (
          <div key={label}>
            <label style={labelSt}>{label}</label>
            <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
          </div>
        ))}

        <button onClick={handleSubmit} disabled={status === "saving"} style={{
          marginTop: 8, padding: "16px", borderRadius: 16, border: "none",
          background: status === "saved" ? "linear-gradient(135deg,#27ae60,#2ecc71)"
                    : status === "error" ? "linear-gradient(135deg,#e74c3c,#c0392b)"
                    : `linear-gradient(135deg, ${col.h}, ${col.h}bb)`,
          color: "#fff", fontSize: 16, fontWeight: 700,
          fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.3s",
          boxShadow: `0 8px 24px ${col.h}44`,
        }}>
          {status === "saving" ? <><Icon name="spin" size={18}/> Guardando...</>
         : status === "saved"  ? <><Icon name="check" size={18}/> ¡Guardado!</>
         : status === "error"  ? "❌ Error al guardar"
         : <><Icon name="plus" size={18}/> Guardar clase</>}
        </button>
      </div>
    </div>
  );
}

// ── ALL RECORDS VIEW (teachers see all records) ─────────────────────────────
function AllRecords({ teacher }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterMonth, setFilterMonth] = useState("Todos");
  const [filterTeacher, setFilterTeacher] = useState("Todos");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    new_work: "", reading: "", dictation: "", activity: ""
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("classes")
      .select("*")
      .order("date", { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta clase?")) {
      await supabase.from("classes").delete().eq("id", id);
      load();
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditForm({
      new_work: record.new_work || "",
      reading: record.reading || "",
      dictation: record.dictation || "",
      activity: record.activity || ""
    });
  };

  const handleSaveEdit = async (id) => {
    const { error } = await supabase
      .from("classes")
      .update({
        new_work: editForm.new_work,
        reading: editForm.reading,
        dictation: editForm.dictation,
        activity: editForm.activity
      })
      .eq("id", id);

    if (!error) {
      setEditingId(null);
      load();
    }
  };

  const teachers = [...new Set(records.map(r => r.teacher_name))];
  const usedMonths = [...new Set(records.map(r => MONTHS[new Date(r.date + "T12:00:00").getMonth()]))];

  const filtered = records.filter(r => {
    const month = MONTHS[new Date(r.date + "T12:00:00").getMonth()];
    return (filterGroup === "Todos" || r.group === filterGroup)
        && (filterMonth === "Todos" || month === filterMonth)
        && (filterTeacher === "Todos" || r.teacher_name === filterTeacher);
  });

  // Estadísticas
  const totalRegistros = records.length;
  const registrosHoy = records.filter(r => r.date === todayStr()).length;
  const misRegistros = records.filter(r => r.teacher_id === teacher.id).length;

  return (
    <div style={{ paddingBottom: 88 }}>
      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#2C3E50)", padding: "28px 20px 24px", borderRadius: "0 0 28px 28px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 4 }}>
          TODAS LAS CLASES
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display',serif" }}>
          {loading ? "..." : `${filtered.length} clases`}
        </div>
        
        {/* Mini stats */}
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 20 }}>
            <span style={{ fontSize: 12, color: "#fff" }}>📊 Total: {totalRegistros}</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 20 }}>
            <span style={{ fontSize: 12, color: "#fff" }}>📅 Hoy: {registrosHoy}</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 20 }}>
            <span style={{ fontSize: 12, color: "#fff" }}>👤 Tuyos: {misRegistros}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {teachers.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Todos", ...teachers].map(name => (
              <button key={name} onClick={() => setFilterTeacher(name)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: filterTeacher === name ? "2px solid #1A1A2E" : "2px solid #e0e0e0",
                background: filterTeacher === name ? "#1A1A2E" : "#fafafa",
                color: filterTeacher === name ? "#fff" : "#999",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}>👤 {name}</button>
            ))}
          </div>
        )}
        
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Todos", ...GROUPS].map(g => {
            const gc = COLORS[g]; const active = filterGroup === g;
            return (
              <button key={g} onClick={() => setFilterGroup(g)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: active ? `2px solid ${gc ? gc.h : "#1A1A2E"}` : "2px solid #e0e0e0",
                background: active ? (gc ? gc.l : "#1A1A2E") : "#fafafa",
                color: active ? (gc ? gc.h : "#fff") : "#999",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}>{g}</button>
            );
          })}
        </div>
        
        {usedMonths.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Todos", ...usedMonths].map(m => (
              <button key={m} onClick={() => setFilterMonth(m)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: filterMonth === m ? "2px solid #1A1A2E" : "2px solid #e0e0e0",
                background: filterMonth === m ? "#1A1A2E" : "#fafafa",
                color: filterMonth === m ? "#fff" : "#999",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}>{m}</button>
            ))}
          </div>
        )}
      </div>

      {/* Records list */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading && <div style={{ textAlign: "center", color: "#bbb", padding: 40 }}>Cargando...</div>}
        {!loading && filtered.length === 0 && <div style={{ textAlign: "center", color: "#bbb", padding: 40 }}>No hay clases aún.</div>}
        
        {filtered.map(r => {
          const col = COLORS[r.group] || { h: "#555", l: "#eee" };
          const isOwnRecord = r.teacher_id === teacher.id;
          const isEditing = editingId === r.id;
          
          return (
            <div key={r.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <div style={{ background: `linear-gradient(90deg,${col.h},${col.h}cc)`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.group}</span>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>{fmtDate(r.date)}</span>
                  <span style={{ 
                    background: isOwnRecord ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)", 
                    color: "#fff", 
                    fontSize: 11, 
                    padding: "2px 8px", 
                    borderRadius: 99,
                    fontWeight: isOwnRecord ? 600 : 400
                  }}>
                    👤 {r.teacher_name} {isOwnRecord && "(tú)"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {isOwnRecord && !isEditing && (
                    <button onClick={() => handleEdit(r)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#fff" }}>
                      <Icon name="edit" size={16}/>
                    </button>
                  )}
                  {isOwnRecord && (
                    <button onClick={() => handleDelete(r.id)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#fff" }}>
                      <Icon name="trash" size={16}/>
                    </button>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                    value={editForm.new_work}
                    onChange={(e) => setEditForm({...editForm, new_work: e.target.value})}
                    placeholder="New Work"
                    style={inputStyle}
                  />
                  <input
                    value={editForm.reading}
                    onChange={(e) => setEditForm({...editForm, reading: e.target.value})}
                    placeholder="Reading"
                    style={inputStyle}
                  />
                  <input
                    value={editForm.dictation}
                    onChange={(e) => setEditForm({...editForm, dictation: e.target.value})}
                    placeholder="Dictation"
                    style={inputStyle}
                  />
                  <input
                    value={editForm.activity}
                    onChange={(e) => setEditForm({...editForm, activity: e.target.value})}
                    placeholder="Actividad"
                    style={inputStyle}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleSaveEdit(r.id)} style={{ flex: 1, padding: "10px", background: col.h, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>
                      Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "10px", background: "#e0e0e0", color: "#666", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                  {[["New Work", r.new_work], ["Reading", r.reading], ["Dictation", r.dictation], ["Actividad", r.activity]]
                    .filter(([, v]) => v)
                    .map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, color: "#aaa", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 2 }}>{label.toUpperCase()}</div>
                        <div style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MY RECORDS VIEW (teacher sees own records) ────────────────────────────────
function MyRecords({ teacher }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterMonth, setFilterMonth] = useState("Todos");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", teacher.id)
      .order("date", { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }, [teacher.id]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta clase?")) {
      await supabase.from("classes").delete().eq("id", id);
      load();
    }
  };

  const usedMonths = [...new Set(records.map(r => MONTHS[new Date(r.date + "T12:00:00").getMonth()]))];
  const filtered = records.filter(r => {
    const month = MONTHS[new Date(r.date + "T12:00:00").getMonth()];
    return (filterGroup === "Todos" || r.group === filterGroup)
        && (filterMonth === "Todos" || month === filterMonth);
  });

  return (
    <div style={{ paddingBottom: 88 }}>
      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#2C3E50)", padding: "28px 20px 24px", borderRadius: "0 0 28px 28px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 4 }}>MIS CLASES</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display',serif" }}>
          {loading ? "..." : `${filtered.length} clases`}
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Todos", ...GROUPS].map(g => {
            const gc = COLORS[g];
            const active = filterGroup === g;
            return (
              <button key={g} onClick={() => setFilterGroup(g)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: active ? `2px solid ${gc ? gc.h : "#1A1A2E"}` : "2px solid #e0e0e0",
                background: active ? (gc ? gc.l : "#1A1A2E") : "#fafafa",
                color: active ? (gc ? gc.h : "#fff") : "#999",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}>{g}</button>
            );
          })}
        </div>
        {usedMonths.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Todos", ...usedMonths].map(m => (
              <button key={m} onClick={() => setFilterMonth(m)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: filterMonth === m ? "2px solid #1A1A2E" : "2px solid #e0e0e0",
                background: filterMonth === m ? "#1A1A2E" : "#fafafa",
                color: filterMonth === m ? "#fff" : "#999",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}>{m}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading && <div style={{ textAlign: "center", color: "#bbb", padding: 40 }}>Cargando...</div>}
        {!loading && filtered.length === 0 && <div style={{ textAlign: "center", color: "#bbb", padding: 40 }}>No hay clases aún.</div>}
        {filtered.map(r => {
          const col = COLORS[r.group] || { h: "#555", l: "#eee" };
          return (
            <div key={r.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <div style={{ background: `linear-gradient(90deg,${col.h},${col.h}cc)`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.group}</span>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>{fmtDate(r.date)}</span>
                </div>
                <button onClick={() => handleDelete(r.id)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#fff" }}>
                  <Icon name="trash" size={16}/>
                </button>
              </div>
              <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                {[["New Work", r.new_work], ["Reading", r.reading], ["Dictation", r.dictation], ["Actividad", r.activity]]
                  .filter(([, v]) => v)
                  .map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: "#aaa", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 2 }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{val}</div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ADMIN PANEL MEJORADO ─────────────────────────────────────────────────────
function AdminPanel() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTeacher, setFilterTeacher] = useState("Todos");
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [filterMonth, setFilterMonth] = useState("Todos");
  const [adminTab, setAdminTab] = useState("records");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    new_work: "", reading: "", dictation: "", activity: ""
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("classes").select("*").order("date", { ascending: false });
    setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta clase?")) {
      await supabase.from("classes").delete().eq("id", id);
      load();
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditForm({
      new_work: record.new_work || "",
      reading: record.reading || "",
      dictation: record.dictation || "",
      activity: record.activity || ""
    });
  };

  const handleSaveEdit = async (id) => {
    const { error } = await supabase
      .from("classes")
      .update({
        new_work: editForm.new_work,
        reading: editForm.reading,
        dictation: editForm.dictation,
        activity: editForm.activity
      })
      .eq("id", id);

    if (!error) {
      setEditingId(null);
      load();
    }
  };

  const teachers = TEACHERS.filter(t => t.role === "teacher");
  const usedMonths = [...new Set(records.map(r => MONTHS[new Date(r.date + "T12:00:00").getMonth()]))];

  const filtered = records.filter(r => {
    const month = MONTHS[new Date(r.date + "T12:00:00").getMonth()];
    return (filterTeacher === "Todos" || r.teacher_name === filterTeacher)
        && (filterGroup === "Todos" || r.group === filterGroup)
        && (filterMonth === "Todos" || month === filterMonth);
  });

  // Stats avanzadas
  const total = records.length;
  const hoy = new Date().toISOString().split('T')[0];
  const registrosHoy = records.filter(r => r.date === hoy).length;
  
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  const registrosSemana = records.filter(r => new Date(r.date) >= hace7Dias).length;
  
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);
  const registrosMes = records.filter(r => new Date(r.date) >= hace30Dias).length;
  const promedioDiario = (registrosMes / 30).toFixed(1);

  const byTeacher = teachers.map(t => ({
    name: t.name,
    count: records.filter(r => r.teacher_id === t.id).length,
  }));
  
  const byGroup = GROUPS.map(g => ({
    group: g, col: COLORS[g] || { h: "#555", l: "#eee" },
    count: records.filter(r => r.group === g).length,
  }));
  
  const byMonth = MONTHS
    .map(m => ({ month: m, count: records.filter(r => MONTHS[new Date(r.date + "T12:00:00").getMonth()] === m).length }))
    .filter(x => x.count > 0);
  
  const maxCount = Math.max(...[...byTeacher, ...byGroup, ...byMonth].map(x => x.count), 1);

  return (
    <div style={{ paddingBottom: 88 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1A1A2E,#0F3460)", padding: "28px 20px 20px", borderRadius: "0 0 28px 28px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Icon name="shield" size={16}/>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Mono',monospace", letterSpacing: 2 }}>PANEL ADMIN</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display',serif" }}>
          {loading ? "Cargando..." : `${total} clases totales`}
        </div>
        
        {/* Mini stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "12px", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>HOY</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{registrosHoy}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "12px", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>SEMANA</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{registrosSemana}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "12px", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>MES</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{registrosMes}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "12px", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>PROMEDIO</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{promedioDiario}</div>
          </div>
        </div>

        {/* Admin sub-tabs */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {[["records","📋 Registros"],["stats","📊 Estadísticas"]].map(([id, label]) => (
            <button key={id} onClick={() => setAdminTab(id)} style={{
              padding: "8px 16px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 600,
              background: adminTab === id ? "#fff" : "rgba(255,255,255,0.15)",
              color: adminTab === id ? "#1A1A2E" : "#fff",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {adminTab === "records" && (
        <>
          {/* Filters */}
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Todos", ...teachers.map(t => t.name)].map(name => (
                <button key={name} onClick={() => setFilterTeacher(name)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: filterTeacher === name ? "2px solid #1A1A2E" : "2px solid #e0e0e0",
                  background: filterTeacher === name ? "#1A1A2E" : "#fafafa",
                  color: filterTeacher === name ? "#fff" : "#999",
                  cursor: "pointer",
                }}>👤 {name}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Todos", ...GROUPS].map(g => {
                const gc = COLORS[g]; const active = filterGroup === g;
                return (
                  <button key={g} onClick={() => setFilterGroup(g)} style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: active ? `2px solid ${gc ? gc.h : "#1A1A2E"}` : "2px solid #e0e0e0",
                    background: active ? (gc ? gc.l : "#1A1A2E") : "#fafafa",
                    color: active ? (gc ? gc.h : "#fff") : "#999",
                    cursor: "pointer",
                  }}>{g}</button>
                );
              })}
            </div>
            {usedMonths.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Todos", ...usedMonths].map(m => (
                  <button key={m} onClick={() => setFilterMonth(m)} style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: filterMonth === m ? "2px solid #1A1A2E" : "2px solid #e0e0e0",
                    background: filterMonth === m ? "#1A1A2E" : "#fafafa",
                    color: filterMonth === m ? "#fff" : "#999",
                    cursor: "pointer",
                  }}>{m}</button>
                ))}
              </div>
            )}
            <div style={{ fontSize: 12, color: "#aaa" }}>
              Mostrando {filtered.length} de {total} registros
            </div>
          </div>

          {/* Records list */}
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {loading && <div style={{ textAlign: "center", color: "#bbb", padding: 40 }}>Cargando...</div>}
            {!loading && filtered.length === 0 && <div style={{ textAlign: "center", color: "#bbb", padding: 40 }}>No hay registros.</div>}
            
            {filtered.map(r => {
              const col = COLORS[r.group] || { h: "#555", l: "#eee" };
              const isEditing = editingId === r.id;
              
              return (
                <div key={r.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                  <div style={{ background: `linear-gradient(90deg,${col.h},${col.h}cc)`, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.group}</span>
                      <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>{fmtDate(r.date)}</span>
                      <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 99 }}>
                        👤 {r.teacher_name}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!isEditing && (
                        <button onClick={() => handleEdit(r)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#fff" }}>
                          <Icon name="edit" size={16}/>
                        </button>
                      )}
                      <button onClick={() => handleDelete(r.id)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#fff" }}>
                        <Icon name="trash" size={16}/>
                      </button>
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <input
                        value={editForm.new_work}
                        onChange={(e) => setEditForm({...editForm, new_work: e.target.value})}
                        placeholder="New Work"
                        style={inputStyle}
                      />
                      <input
                        value={editForm.reading}
                        onChange={(e) => setEditForm({...editForm, reading: e.target.value})}
                        placeholder="Reading"
                        style={inputStyle}
                      />
                      <input
                        value={editForm.dictation}
                        onChange={(e) => setEditForm({...editForm, dictation: e.target.value})}
                        placeholder="Dictation"
                        style={inputStyle}
                      />
                      <input
                        value={editForm.activity}
                        onChange={(e) => setEditForm({...editForm, activity: e.target.value})}
                        placeholder="Actividad"
                        style={inputStyle}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleSaveEdit(r.id)} style={{ flex: 1, padding: "10px", background: col.h, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>
                          Guardar
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "10px", background: "#e0e0e0", color: "#666", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                      {[["New Work", r.new_work], ["Reading", r.reading], ["Dictation", r.dictation], ["Actividad", r.activity]]
                        .filter(([, v]) => v)
                        .map(([label, val]) => (
                          <div key={label}>
                            <div style={{ fontSize: 10, color: "#aaa", fontFamily: "'DM Mono',monospace", letterSpacing: 1, marginBottom: 2 }}>{label.toUpperCase()}</div>
                            <div style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{val}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {adminTab === "stats" && (
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={card}>
            <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>POR PROFESOR</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {byTeacher.map(({ name, count }) => (
                <div key={name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>👤 {name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E" }}>{count}</span>
                  </div>
                  <div style={{ background: "#f0f0f0", borderRadius: 99, height: 8, overflow: "hidden" }}>
                    <div style={{ width: total > 0 ? `${(count/total)*100}%` : "0%", background: "linear-gradient(90deg,#1A1A2E,#4472C4)", height: "100%", borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>POR GRUPO</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {byGroup.map(({ group, col, count }) => (
                <div key={group}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: col.h }}>{group}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>{count}</span>
                  </div>
                  <div style={{ background: "#f0f0f0", borderRadius: 99, height: 8, overflow: "hidden" }}>
                    <div style={{ width: total > 0 ? `${(count/total)*100}%` : "0%", background: `linear-gradient(90deg,${col.h},${col.h}88)`, height: "100%", borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {byMonth.length > 0 && (
            <div style={card}>
              <div style={{ fontSize: 11, color: "#aaa", fontFamily: "'DM Mono',monospace", letterSpacing: 2, marginBottom: 16 }}>POR MES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {byMonth.map(({ month, count }) => (
                  <div key={month} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 88, fontSize: 13, color: "#666", flexShrink: 0 }}>{month}</div>
                    <div style={{ flex: 1, background: "#f0f0f0", borderRadius: 99, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${(count/maxCount)*100}%`, background: "linear-gradient(90deg,#1A1A2E,#4472C4)", height: "100%", borderRadius: 99 }} />
                    </div>
                    <div style={{ width: 28, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#333" }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("form");
  const [refresh, setRefresh] = useState(0);

  const handleLogin = (teacher) => { 
    setUser(teacher); 
    setTab(teacher.role === "admin" ? "admin" : "form"); 
  };
  
  const handleLogout = () => { 
    setUser(null); 
    setTab("form"); 
  };

  if (!user) return <PinLogin onLogin={handleLogin} />;

  const isAdmin = user.role === "admin";

  const tabs = isAdmin
    ? [{ id: "admin", label: "Panel", icon: "shield" }]
    : [
        { id: "form",    label: "Registrar", icon: "plus"  },
        { id: "records", label: "Mis clases", icon: "list" },
        { id: "all",     label: "Todos",      icon: "users" }, // 👈 NUEVA PESTAÑA
      ];

  return (
    <>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#f5f6fa" }}>
        {tab === "form"    && <FormView teacher={user} onSave={() => setRefresh(r => r+1)} />}
        {tab === "records" && <MyRecords teacher={user} key={refresh} />}
        {tab === "all"     && <AllRecords teacher={user} key={refresh} />}
        {tab === "admin"   && <AdminPanel />}

        {/* Bottom nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)",
          borderTop: "1px solid #eee",
          display: "flex", alignItems: "center",
          padding: "8px 0 16px", zIndex: 100,
        }}>
          {tabs.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, border: "none", background: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              color: tab === id ? "#1A1A2E" : "#bbb", transition: "color 0.2s",
            }}>
              <div style={{ padding: "6px 16px", borderRadius: 12, background: tab === id ? "#1A1A2E10" : "transparent" }}>
                <Icon name={icon}/>
              </div>
              <span style={{ fontSize: 11, fontWeight: tab === id ? 700 : 500, fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
            </button>
          ))}
          {/* Logout */}
          <button onClick={handleLogout} style={{
            flex: 1, border: "none", background: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            color: "#bbb",
          }}>
            <div style={{ padding: "6px 16px", borderRadius: 12 }}><Icon name="logout"/></div>
            <span style={{ fontSize: 11, fontWeight: 500, fontFamily: "'DM Sans',sans-serif" }}>Salir</span>
          </button>
        </div>
      </div>
    </>
  );
}
 
