"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { useState } from "react";
import { AssetPickerModal } from "../AssetPickerModal";
import Image from "next/image";
import { ArrowRight, Trash2, Copy, ClipboardPaste } from "lucide-react";

export const CraftingBlock = createReactBlockSpec(
  {
    type: "crafting",
    propSchema: {
      slotsJson: {
        default: '["", "", "", "", "", "", "", "", ""]' // 9 slots, JSON stringified
      },
      outputAsset: {
        default: "" // URL of the output item
      },
      outputName: {
        default: "" // Name of the output item
      },
      outputCount: {
        default: "1" // Number of output items
      }
    },
    content: "none",
  },
  {
    render: (props) => {
      const formatItemName = (name: string) => {
        if (!name) return "";
        return name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]/g, " ")    // spaces instead of - or _
          .replace(/\b\w/g, c => c.toUpperCase()); // capitalize
      }

      // Parse the slots
      let slots: any[] = ["", "", "", "", "", "", "", "", ""];
      try {
        slots = JSON.parse(props.block.props.slotsJson);
      } catch (e) {
        // ignore
      }

      const [pickerOpen, setPickerOpen] = useState(false);
      const [editingIndex, setEditingIndex] = useState<number | 'output' | null>(null);
      const [copiedAsset, setCopiedAsset] = useState<any>(null);

      function handleSelectAsset(assetData: any) {
        if (editingIndex === 'output') {
          props.editor.updateBlock(props.block, {
            type: "crafting",
            props: { ...props.block.props, outputAsset: assetData.url, outputName: assetData.name || "" }
          });
        } else if (typeof editingIndex === 'number') {
          const newSlots = [...slots];
          newSlots[editingIndex] = assetData;
          props.editor.updateBlock(props.block, {
            type: "crafting",
            props: { ...props.block.props, slotsJson: JSON.stringify(newSlots) }
          });
        }
        setPickerOpen(false);
        setEditingIndex(null);
      }

      function openPicker(index: number | 'output') {
        if (copiedAsset && typeof index === 'number') {
          // Paste it directly
          const newSlots = [...slots];
          newSlots[index] = copiedAsset;
          props.editor.updateBlock(props.block, {
            type: "crafting",
            props: { ...props.block.props, slotsJson: JSON.stringify(newSlots) }
          });
          setCopiedAsset(null);
        } else if (copiedAsset && index === 'output') {
          const url = typeof copiedAsset === 'string' ? copiedAsset : copiedAsset.url;
          props.editor.updateBlock(props.block, {
            type: "crafting",
            props: { ...props.block.props, outputAsset: url }
          });
          setCopiedAsset(null);
        } else {
          setEditingIndex(index);
          setPickerOpen(true);
        }
      }

      function clearSlot(e: React.MouseEvent, index: number | 'output') {
        e.stopPropagation();
        if (index === 'output') {
          props.editor.updateBlock(props.block, {
            type: "crafting",
            props: { ...props.block.props, outputAsset: "" }
          });
        } else {
          const newSlots = [...slots];
          newSlots[index] = "";
          props.editor.updateBlock(props.block, {
            type: "crafting",
            props: { ...props.block.props, slotsJson: JSON.stringify(newSlots) }
          });
        }
      }

      return (
        <div className="flex flex-col bg-[#c6c6c6] p-2 rounded-md border-4 border-b-[#555] border-r-[#555] border-t-[#fff] border-l-[#fff] w-fit shadow-md my-4" contentEditable={false}>
          <div className="text-xs font-bold text-black mb-1 self-start font-minecraft">Crafting</div>
          
          <div className="flex items-center gap-6">
            <div className="grid grid-cols-3 gap-[2px]">
              {slots.map((s, i) => {
                const url = typeof s === 'string' ? s : s?.url || "";
                const rawName = typeof s === 'string' ? "" : s?.name || "";
                const name = formatItemName(rawName);
                return (
                  <div 
                    key={i} 
                    onClick={() => openPicker(i)}
                    className={`w-16 h-16 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#fff] border-r-[#fff] flex items-center justify-center cursor-pointer transition-colors relative group ${copiedAsset ? 'hover:bg-primary/20' : 'hover:bg-[#a0a0a0]'}`}
                  >
                    {url ? (
                      <>
                        <Image src={url} alt={name || "Slot"} fill className="p-1 object-contain pixelated" />
                        <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button onClick={(e) => { e.stopPropagation(); setCopiedAsset(s); }} className="bg-blue-500 text-white rounded-full p-0.5" title="Copiar"><Copy className="w-3 h-3" /></button>
                          <button onClick={(e) => clearSlot(e, i)} className="bg-red-500 text-white rounded-full p-0.5" title="Borrar"><Trash2 className="w-3 h-3" /></button>
                        </div>
                        {name && !copiedAsset && (
                          <div className="absolute z-50 invisible group-hover:visible bg-[#110111] border-[2px] border-[#3a0088] px-2 py-1 text-white font-minecraft shadow-lg whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2 text-xs pointer-events-none">
                            <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">{name}</span>
                          </div>
                        )}
                      </>
                    ) : copiedAsset ? (
                      <div className="absolute inset-0 flex items-center justify-center opacity-50 z-10 pointer-events-none">
                        <ClipboardPaste className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Arrow */}
            <div className="text-[#373737]">
              <ArrowRight className="w-10 h-10" strokeWidth={3} />
            </div>

            {/* Output */}
            <div 
              onClick={() => openPicker('output')}
              className="w-16 h-16 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#fff] border-r-[#fff] flex items-center justify-center cursor-pointer hover:bg-[#a0a0a0] transition-colors relative group"
            >
              {props.block.props.outputAsset ? (
                <>
                  <Image src={props.block.props.outputAsset} alt={formatItemName(props.block.props.outputName) || "Output"} fill className="p-1 object-contain pixelated" />
                  <button onClick={(e) => clearSlot(e, 'output')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 z-20"><Trash2 className="w-3 h-3" /></button>
                  {props.block.props.outputName && (
                    <div className="absolute z-50 invisible group-hover:visible bg-[#110111] border-[2px] border-[#3a0088] px-2 py-1 text-white font-minecraft shadow-lg whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2 text-xs pointer-events-none">
                      <span className="drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">{formatItemName(props.block.props.outputName)}</span>
                    </div>
                  )}
                  {props.block.props.outputCount !== "1" && (
                    <span className="absolute bottom-0 right-0 font-minecraft text-white drop-shadow-[1px_1px_0_rgba(0,0,0,1)] text-xs z-10 px-1">
                      {props.block.props.outputCount}
                    </span>
                  )}
                </>
              ) : null}
            </div>
          </div>
          {copiedAsset && (
            <div className="mt-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded w-fit flex items-center gap-1 cursor-pointer hover:bg-red-500/10 hover:text-red-500 transition-colors" onClick={() => setCopiedAsset(null)}>
              <ClipboardPaste className="w-3 h-3" /> Item copiado. Haz clic en un slot para pegar. (Click aquí para cancelar)
            </div>
          )}

          <div className="flex gap-2 items-center mt-4">
             <label className="text-black text-xs font-minecraft">Cantidad de salida:</label>
             <input 
               type="text" 
               className="w-12 px-1 py-0.5 text-xs border border-[#373737] bg-white text-black font-minecraft" 
               value={props.block.props.outputCount}
               onChange={(e) => props.editor.updateBlock(props.block, {
                  type: "crafting",
                  props: { ...props.block.props, outputCount: e.target.value }
               })}
             />
          </div>

          {pickerOpen && (
            <AssetPickerModal 
              category="items"
              onSelect={(asset) => handleSelectAsset(asset.url)}
              onClose={() => { setPickerOpen(false); setEditingIndex(null); }}
            />
          )}
        </div>
      );
    },
  }
);
