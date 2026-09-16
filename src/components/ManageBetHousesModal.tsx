import { PointerEvent, useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import { api, extractErrorMessage } from "../api/client";
import { BetHouse, BetHouseGroup } from "../api/types";
import { SUGGESTED_COLORS } from "../utils/colors";
import { GripIcon, PencilIcon, XIcon } from "./icons";

interface Props {
  onClose: () => void;
  onChanged: () => void;
}

const NO_GROUP = "";
const NEW_GROUP = "__new__";

export function ManageBetHousesModal({ onClose, onChanged }: Props) {
  const [houses, setHouses] = useState<BetHouse[] | null>(null);
  const [groups, setGroups] = useState<BetHouseGroup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);
  const [groupSelection, setGroupSelection] = useState(NO_GROUP);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    api.get<BetHouse[]>("/bets/houses").then((res) => setHouses(res.data));
    api.get<BetHouseGroup[]>("/bets/groups").then((res) => setGroups(res.data));
  }, []);

  function startEdit(house: BetHouse) {
    setEditingId(house.id);
    setName(house.name);
    setColor(house.color || SUGGESTED_COLORS[0]);
    setGroupSelection(house.groupId || NO_GROUP);
    setNewGroupName("");
    setError(null);
  }

  async function handleSave(id: string) {
    setError(null);
    setSaving(true);
    try {
      let groupId: string | null = groupSelection || null;
      if (groupSelection === NEW_GROUP) {
        if (!newGroupName.trim()) {
          setError("Digite um nome pro grupo novo.");
          setSaving(false);
          return;
        }
        const groupRes = await api.post<BetHouseGroup>("/bets/groups", { name: newGroupName.trim() });
        setGroups((prev) => [...prev, groupRes.data]);
        groupId = groupRes.data.id;
      }
      const res = await api.put<BetHouse>(`/bets/houses/${id}`, { name, color });
      const res2 = await api.put<BetHouse>(`/bets/houses/${id}/group`, { groupId });
      setHouses((prev) => prev?.map((h) => (h.id === id ? { ...res.data, groupId: res2.data.groupId, groupName: res2.data.groupName } : h)) ?? null);
      setEditingId(null);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await api.delete(`/bets/houses/${id}`);
      setHouses((prev) => prev?.filter((h) => h.id !== id) ?? null);
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível excluir essa casa."));
    }
  }

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>, houseId: string) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragId.current = houseId;
    setDraggingId(houseId);
  }

  function handlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    if (!dragId.current || !houses) return;
    const draggedIndex = houses.findIndex((h) => h.id === dragId.current);
    if (draggedIndex === -1) return;
    const currentY = e.clientY;

    for (let i = 0; i < houses.length; i++) {
      if (i === draggedIndex) continue;
      const el = rowRefs.current.get(houses[i].id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const shouldMoveUp = i < draggedIndex && currentY < midpoint;
      const shouldMoveDown = i > draggedIndex && currentY > midpoint;
      if (shouldMoveUp || shouldMoveDown) {
        setHouses((prev) => {
          if (!prev) return prev;
          const next = [...prev];
          const [moved] = next.splice(draggedIndex, 1);
          next.splice(i, 0, moved);
          return next;
        });
        break;
      }
    }
  }

  async function handlePointerUp() {
    if (!dragId.current || !houses) return;
    dragId.current = null;
    setDraggingId(null);
    try {
      await api.put("/bets/houses/reorder", { houseIds: houses.map((h) => h.id) });
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err, "Não foi possível salvar a nova ordem."));
    }
  }

  return (
    <Modal title="Gerenciar casas" onClose={onClose}>
      {houses === null ? (
        <p className="py-6 text-center text-sm text-ink-soft">Carregando…</p>
      ) : houses.length === 0 ? (
        <p className="py-6 text-sm text-ink-soft">Nenhuma casa cadastrada ainda.</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-ink-soft">Segure e arraste pra reordenar.</p>
          <ul className="max-h-[60vh] divide-y divide-line/70 overflow-y-auto">
            {houses.map((house) => (
              <li
                key={house.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(house.id, el);
                  else rowRefs.current.delete(house.id);
                }}
                className={`py-3 transition-opacity ${draggingId === house.id ? "opacity-60" : ""}`}
              >
                {editingId === house.id ? (
                  <div className="space-y-3">
                    <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
                    <div className="flex flex-wrap gap-2.5">
                      {SUGGESTED_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className="h-7 w-7 rounded-full transition-transform"
                          style={{
                            backgroundColor: c,
                            boxShadow: color === c ? `0 0 0 2px rgb(var(--color-surface)), 0 0 0 4px ${c}` : undefined,
                            transform: color === c ? "scale(1.08)" : undefined,
                          }}
                          aria-label={`Cor ${c}`}
                        />
                      ))}
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`group-${house.id}`}>Grupo</label>
                      <select
                        id={`group-${house.id}`}
                        className="field"
                        value={groupSelection}
                        onChange={(e) => setGroupSelection(e.target.value)}
                      >
                        <option value={NO_GROUP}>Sem grupo</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                        <option value={NEW_GROUP}>+ Criar novo grupo…</option>
                      </select>
                      {groupSelection === NEW_GROUP && (
                        <input
                          className="field mt-2"
                          placeholder="Nome do grupo"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                        />
                      )}
                      <p className="mt-1 text-xs text-ink-soft">
                        Casas do mesmo grupo aparecem juntas com o resultado somado, no dia e no mês.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(null)} className="btn-secondary flex-1">Cancelar</button>
                      <button onClick={() => handleSave(house.id)} disabled={saving} className="btn-primary flex-1">
                        {saving ? "Salvando…" : "Salvar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-ink">
                      <button
                        onPointerDown={(e) => handlePointerDown(e, house.id)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className="icon-btn h-8 w-8 shrink-0 cursor-grab touch-none active:cursor-grabbing"
                        aria-label={`Reordenar ${house.name}`}
                      >
                        <GripIcon className="h-4 w-4" />
                      </button>
                      <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: house.color || "#8E8E93" }} />
                      <span className="truncate">{house.name}</span>
                      {house.groupName && <span className="pill shrink-0 bg-accent-soft text-accent">{house.groupName}</span>}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => startEdit(house)} className="icon-btn" aria-label={`Editar ${house.name}`}>
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(house.id)}
                        className="icon-btn text-danger"
                        aria-label={`Excluir ${house.name}`}
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Modal>
  );
}
