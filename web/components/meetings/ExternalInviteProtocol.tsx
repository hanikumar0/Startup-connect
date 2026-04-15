"use client";

import React, { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  UserPlus, 
  Mail, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Check
} from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface Participant {
  email: string;
  name?: string;
  selected?: boolean;
}

interface ExternalInviteProtocolProps {
  onAddParticipants: (participants: { email: string, name?: string }[]) => void;
  existingEmails: string[];
}

export const ExternalInviteProtocol: React.FC<ExternalInviteProtocolProps> = ({ 
  onAddParticipants,
  existingEmails 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [manualEmails, setManualEmails] = useState<string>("");
  const [parsedParticipants, setParsedParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    setIsParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const participants: Participant[] = data
          .map((row) => {
            const email = row.email || row.Email || row.EMAIL || "";
            const name = row.name || row.Name || row.NAME || "";
            return { email: email.trim(), name: name.trim(), selected: true };
          })
          .filter((p) => p.email && validateEmail(p.email));

        if (participants.length === 0) {
          toast.error("No valid emails found in CSV");
        } else {
          setParsedParticipants(participants);
          setActiveTab("list");
          toast.success(`Parsed ${participants.length} participants from CSV`);
        }
        setIsParsing(false);
      },
      error: (error) => {
        toast.error("Error parsing CSV: " + error.message);
        setIsParsing(false);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleManualAdd = () => {
    // Split by comma, newline, or space
    const emails = manualEmails
      .split(/[,\n\s]+/)
      .map(e => e.trim())
      .filter(e => e && validateEmail(e));
    
    const uniqueEmails = Array.from(new Set(emails));
    const newParticipants = uniqueEmails.map(email => ({ email }));
    
    if (newParticipants.length > 0) {
      onAddParticipants(newParticipants);
      setManualEmails("");
      setIsOpen(false);
      toast.success(`Success: Added ${newParticipants.length} external participants`);
    } else {
      toast.error("Please enter valid email addresses");
    }
  };

  const handleAddFromList = () => {
    const selected = parsedParticipants.filter(p => p.selected);
    if (selected.length > 0) {
      onAddParticipants(selected.map(({ email, name }) => ({ email, name })));
      setIsOpen(false);
      toast.success(`Sync Complete: Added ${selected.length} participants`);
    } else {
      toast.error("No participants selected");
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    setParsedParticipants(prev => prev.map(p => ({ ...p, selected: checked })));
  };

  const filteredList = parsedParticipants.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = parsedParticipants.filter(p => p.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
          <UserPlus size={14} />
          Add via External Email
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white border-slate-200 p-0 overflow-hidden rounded-[2rem]">
        <DialogHeader className="p-8 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Mail className="text-white" size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase italic tracking-tight">External Invitation Protocol</DialogTitle>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Diligence Node Participant Expansion</p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-8 pt-4 border-b border-slate-100">
            <TabsList className="bg-transparent h-12 w-full justify-start gap-8 p-0">
              <TabsTrigger 
                value="manual" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-0 text-[10px] font-black uppercase tracking-widest italic h-full transition-all"
              >
                Manual Entry
              </TabsTrigger>
              <TabsTrigger 
                value="csv" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-0 text-[10px] font-black uppercase tracking-widest italic h-full transition-all"
              >
                CSV Upload
              </TabsTrigger>
              <TabsTrigger 
                value="list" 
                disabled={parsedParticipants.length === 0}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-0 text-[10px] font-black uppercase tracking-widest italic h-full transition-all"
              >
                List Selection
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px] p-8">
            <TabsContent value="manual" className="mt-0 space-y-6">
              <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="text-slate-400 shrink-0" size={18} />
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-wide">
                      Enter emails separated by commas, spaces, or newlines. Duplicate entries and invalid formats will be filtered automatically by the registry.
                    </p>
                  </div>
                  <Textarea 
                    placeholder="ENTER GUEST EMAILS (COMMA SEPARATED)..."
                    className="min-h-[200px] bg-slate-50/50 border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest p-6 focus-visible:ring-slate-900"
                    value={manualEmails}
                    onChange={(e) => setManualEmails(e.target.value)}
                  />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-widest italic">Cancel</Button>
                <Button 
                    onClick={handleManualAdd}
                    className="bg-slate-900 text-white rounded-xl px-8 text-[11px] font-black uppercase tracking-widest italic hover:bg-slate-800"
                >
                    Incorporate Participants
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="csv" className="mt-0">
               <div 
                className="border-2 border-dashed border-slate-100 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center space-y-4 hover:border-slate-900/20 transition-all cursor-pointer bg-slate-50/30"
                onClick={() => fileInputRef.current?.click()}
               >
                 <div className="h-20 w-20 rounded-[2rem] bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200 mb-4">
                    <Upload className="text-white" size={32} />
                 </div>
                 <h4 className="text-lg font-black uppercase italic tracking-tight text-slate-900">Drop CSV Registry</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px]">Ensure your file contains an 'email' header for automated parsing</p>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    accept=".csv" 
                    onChange={handleCsvUpload} 
                 />
                 <Button className="bg-white text-slate-900 border border-slate-100 rounded-xl px-8 text-[11px] font-black uppercase tracking-widest italic hover:bg-slate-50 mt-4 shadow-sm">
                    Browse Files
                 </Button>
               </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0 space-y-6">
               <div className="flex items-center gap-4 sticky top-0 bg-white z-10 pb-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <Input 
                        placeholder="FILTER PARSED REGISTRY..." 
                        className="pl-10 h-10 border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                    <Checkbox 
                        id="select-all" 
                        onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                        checked={parsedParticipants.every(p => p.selected)}
                    />
                    <label htmlFor="select-all" className="text-[9px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">Select All</label>
                 </div>
               </div>

               <div className="space-y-2">
                 {filteredList.map((p, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                     <div className="flex items-center gap-4">
                        <Checkbox 
                            checked={p.selected}
                            onCheckedChange={(checked) => {
                                const newList = [...parsedParticipants];
                                const index = parsedParticipants.indexOf(p);
                                if (index > -1) {
                                    newList[index] = { ...p, selected: !!checked };
                                    setParsedParticipants(newList);
                                }
                            }}
                        />
                        <div>
                            <p className="text-[11px] font-black uppercase italic text-slate-900">{p.name || "UNIDENTIFIED USER"}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.email}</p>
                        </div>
                     </div>
                     {existingEmails.includes(p.email) && (
                        <Badge variant="outline" className="text-[8px] border-slate-200 text-slate-400">Already Added</Badge>
                     )}
                   </div>
                 ))}
                 {filteredList.length === 0 && (
                     <div className="py-20 text-center">
                        <FileText className="mx-auto text-slate-100 mb-4" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No matching participants found</p>
                     </div>
                 )}
               </div>

               <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    {selectedCount} Participants Identified for Sync
                  </p>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setParsedParticipants([])} className="text-[10px] font-black uppercase tracking-widest italic text-red-400 hover:text-red-500 hover:bg-red-50">Clear Registry</Button>
                    <Button 
                        onClick={handleAddFromList}
                        className="bg-emerald-500 text-white rounded-xl px-8 text-[11px] font-black uppercase tracking-widest italic hover:bg-emerald-600 shadow-lg shadow-emerald-100"
                    >
                        Sync Selection
                    </Button>
                  </div>
               </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
