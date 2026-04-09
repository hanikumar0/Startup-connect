"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Coins, 
  Target, 
  TrendingUp, 
  Users, 
  Loader2, 
  Plus, 
  Trash2,
  Globe,
  Twitter,
  Linkedin,
  MapPin,
  Briefcase
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface PortfolioCompany {
  name: string;
  logo: string;
  website: string;
  stage: string;
  yearInvested: number;
  description: string;
}

interface InvestorFormData {
  investorName: string;
  firmName: string;
  logo: string;
  investorType: string;
  bio: string;
  website: string;
  location: string;
  checkSizeMin: number;
  checkSizeMax: number;
  currency: string;
  preferredStages: string[];
  preferredIndustries: string[];
  preferredGeographies: string[];
  investmentThesis: string;
  portfolioCompanies: PortfolioCompany[];
  linkedin: string;
  twitter: string;
  isPublic: boolean;
}

const INVESTOR_TYPES = ["Angel", "VC", "Micro VC", "Family Office", "Accelerator", "Incubator", "Corporate VC", "Syndicate"];
const STAGES = ["Idea", "MVP", "Revenue", "Growth", "Series A", "Series B"];

export default function InvestorForm({ initialData, mode = "create" }: { initialData?: any, mode?: "create" | "edit" }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<InvestorFormData>(initialData || {
    investorName: "",
    firmName: "",
    logo: "",
    investorType: "Angel",
    bio: "",
    website: "",
    location: "",
    checkSizeMin: 0,
    checkSizeMax: 0,
    currency: "USD",
    preferredStages: [],
    preferredIndustries: [],
    preferredGeographies: [],
    investmentThesis: "",
    portfolioCompanies: [],
    linkedin: "",
    twitter: "",
    isPublic: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [id]: type === "number" ? parseFloat(value) : value 
    }));
  };

  const handleTogglePreference = (type: "preferredStages" | "preferredIndustries", value: string) => {
    const current = [...formData[type]];
    if (current.includes(value)) {
      setFormData({ ...formData, [type]: current.filter(i => i !== value) });
    } else {
      setFormData({ ...formData, [type]: [...current, value] });
    }
  };

  const handlePortfolioChange = (index: number, field: keyof PortfolioCompany, value: any) => {
    const updated = [...formData.portfolioCompanies];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, portfolioCompanies: updated });
  };

  const addPortfolio = () => {
    setFormData({
      ...formData,
      portfolioCompanies: [...formData.portfolioCompanies, { name: "", logo: "", website: "", stage: "", yearInvested: new Date().getFullYear(), description: "" }]
    });
  };

  const removePortfolio = (index: number) => {
    setFormData({
      ...formData,
      portfolioCompanies: formData.portfolioCompanies.filter((_, i) => i !== index)
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const uploadData = new FormData();
    uploadData.append("logo", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/investor/upload-logo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth-storage") ? JSON.parse(localStorage.getItem("auth-storage")!).state.token : ""}`,
          "bypass-tunnel-reminder": "true"
        },
        body: uploadData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, logo: data.url }));
        toast.success("Logo uploaded successfully");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = mode === "create" ? "/api/investor/create" : "/api/investor/update";
      const response = await apiFetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Investor profile ${mode === "create" ? "created" : "updated"} successfully`);
        router.push("/investor/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
        toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-zinc-100 rounded-xl">
          <TabsTrigger value="basic" className="rounded-lg py-2 px-4 shadow-none"><Building2 className="h-4 w-4 mr-2" /> Basic</TabsTrigger>
          <TabsTrigger value="prefs" className="rounded-lg py-2 px-4 shadow-none"><Target className="h-4 w-4 mr-2" /> Prefs</TabsTrigger>
          <TabsTrigger value="checks" className="rounded-lg py-2 px-4 shadow-none"><Coins className="h-4 w-4 mr-2" /> Checks</TabsTrigger>
          <TabsTrigger value="portfolio" className="rounded-lg py-2 px-4 shadow-none"><Briefcase className="h-4 w-4 mr-2" /> Portfolio</TabsTrigger>
          <TabsTrigger value="social" className="rounded-lg py-2 px-4 shadow-none"><Globe className="h-4 w-4 mr-2" /> Social</TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="basic" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Investor Identity</CardTitle>
                    <CardDescription>Tell us who you are and who you represent.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="investorName">Investor Full Name</Label>
                        <Input id="investorName" required value={formData.investorName} onChange={handleChange} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firmName">Firm/Fund Name</Label>
                        <Input id="firmName" value={formData.firmName} onChange={handleChange} placeholder="Alpha Ventures" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <textarea id="bio" required className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm" value={formData.bio} onChange={handleChange} rows={4} placeholder="Summarize your experience and focus..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="investorType">Investor Type</Label>
                        <select id="investorType" className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm" value={formData.investorType} onChange={handleChange}>
                            {INVESTOR_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Primary Location</Label>
                        <Input id="location" required value={formData.location} onChange={handleChange} placeholder="New York, NY" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Logo or Avatar</Label>
                        <div className="flex items-center gap-4">
                            {formData.logo && <img src={formData.logo} alt="Logo" className="h-16 w-16 object-cover rounded-xl border border-zinc-200" />}
                            <Input type="file" accept="image/*" onChange={handleLogoUpload} className="cursor-pointer" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab("prefs")} className="bg-indigo-600 hover:bg-indigo-700">Next: Preferences <Plus className="ml-2 h-4 w-4" /></Button>
            </div>
          </TabsContent>

          <TabsContent value="prefs" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Investment Preferences</CardTitle>
                    <CardDescription>Define the types of startups you want to discover.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <Label>Target Stages</Label>
                        <div className="flex flex-wrap gap-2">
                            {STAGES.map(stage => (
                                <Button 
                                    key={stage} 
                                    type="button" 
                                    variant={formData.preferredStages.includes(stage) ? "default" : "outline"}
                                    className={`rounded-full px-4 h-9 font-medium transition-all ${formData.preferredStages.includes(stage) ? "bg-indigo-600 shadow-md" : "text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50"}`}
                                    onClick={() => handleTogglePreference("preferredStages", stage)}
                                >
                                    {stage}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="investmentThesis">Investment Thesis</Label>
                        <textarea id="investmentThesis" className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm" value={formData.investmentThesis} onChange={handleChange} rows={4} placeholder="What is your philosophy for picking winners?" />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="preferredIndustries">Industries of Interest (Comma separated)</Label>
                        <Input id="preferredIndustries" value={formData.preferredIndustries.join(", ")} onChange={(e) => setFormData({...formData, preferredIndustries: e.target.value.split(",").map(s => s.trim())})} placeholder="AI, Fintech, SaaS" />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>Back</Button>
                <Button type="button" onClick={() => setActiveTab("checks")} className="bg-indigo-600 hover:bg-indigo-700">Next: Check Sizes</Button>
            </div>
          </TabsContent>

          <TabsContent value="checks" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Capital & Checks</CardTitle>
                    <CardDescription>Help startups understand your typical investment range (USD).</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="currency">Investment Currency</Label>
                        <select id="currency" className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-bold italic" value={formData.currency} onChange={handleChange}>
                            <option value="USD">$ USD</option>
                            <option value="EUR">€ EUR</option>
                            <option value="GBP">£ GBP</option>
                            <option value="INR">₹ INR</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="checkSizeMin">Minimum Check Size</Label>
                        <Input id="checkSizeMin" type="number" required value={formData.checkSizeMin} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="checkSizeMax">Maximum Check Size</Label>
                        <Input id="checkSizeMax" type="number" required value={formData.checkSizeMax} onChange={handleChange} />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("prefs")}>Back</Button>
                <Button type="button" onClick={() => setActiveTab("portfolio")} className="bg-indigo-600 hover:bg-indigo-700">Next: Portfolio</Button>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Portfolio Companies</h3>
                <Button type="button" onClick={addPortfolio} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"><Plus className="h-4 w-4 mr-2" /> Add Company</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {formData.portfolioCompanies.map((company, index) => (
                    <Card key={index} className="border-none shadow-sm relative group">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePortfolio(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input value={company.name} onChange={(e) => handlePortfolioChange(index, "name", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Stage at Investment</Label>
                                <Input value={company.stage} onChange={(e) => handlePortfolioChange(index, "stage", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Website</Label>
                                <Input value={company.website} onChange={(e) => handlePortfolioChange(index, "website", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Year Invested</Label>
                                <Input type="number" value={company.yearInvested} onChange={(e) => handlePortfolioChange(index, "yearInvested", e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("checks")}>Back</Button>
                <Button type="button" onClick={() => setActiveTab("social")} className="bg-indigo-600 hover:bg-indigo-700">Next: Social Connect</Button>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Professional Links</CardTitle>
                    <CardDescription>Where can founders find more about you?</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="website">Personal/Firm Website</Label>
                        <Input id="website" value={formData.website} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input id="linkedin" value={formData.linkedin} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter / X</Label>
                        <Input id="twitter" value={formData.twitter} onChange={handleChange} />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between items-center">
                <Button type="button" variant="outline" onClick={() => setActiveTab("portfolio")}>Back</Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-bold shadow-lg shadow-indigo-100">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {mode === "create" ? "Launch Investor Identity" : "Save Preferences"}
                </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </form>
  );
}
