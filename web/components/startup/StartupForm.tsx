"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Coins, 
  Box, 
  Target, 
  TrendingUp, 
  Users, 
  FileUp, 
  Loader2, 
  Plus, 
  Trash2,
  Globe,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";
import { apiFetch, apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";

interface TeamMember {
  name: string;
  role: string;
  linkedin: string;
  avatar: string;
  bio: string;
}

interface StartupFormData {
  startupName: string;
  logo: string;
  tagline: string;
  description: string;
  industry: string;
  subIndustry: string;
  stage: string;
  fundingRequired: number;
  currency: string;
  fundingRaised: number;
  valuation: number;
  foundedYear: number;
  teamSize: number;
  location: string;
  website: string;
  pitchDeckUrl: string;
  demoUrl: string;
  problemStatement: string;
  solution: string;
  businessModel: string;
  marketSize: string;
  tractionMetrics: string;
  revenue: number;
  users: number;
  growthRate: string;
  tags: string[];
  teamMembers: TeamMember[];
  socialLinks: {
    website: string;
    linkedin: string;
    twitter: string;
    github: string;
  };
  isPublic: boolean;
}

export default function StartupForm({ initialData, mode = "create" }: { initialData?: any, mode?: "create" | "edit" }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<StartupFormData>(initialData || {
    startupName: "",
    logo: "",
    tagline: "",
    description: "",
    industry: "",
    subIndustry: "",
    stage: "idea",
    fundingRequired: 0,
    currency: "USD",
    fundingRaised: 0,
    valuation: 0,
    foundedYear: new Date().getFullYear(),
    teamSize: 1,
    location: "",
    website: "",
    pitchDeckUrl: "",
    demoUrl: "",
    problemStatement: "",
    solution: "",
    businessModel: "",
    marketSize: "",
    tractionMetrics: "",
    revenue: 0,
    users: 0,
    growthRate: "",
    tags: [],
    teamMembers: [],
    socialLinks: {
      website: "",
      linkedin: "",
      twitter: "",
      github: "",
    },
    isPublic: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    if (id.includes(".")) {
      const [parent, child] = id.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [id]: type === "number" ? parseFloat(value) : value 
      }));
    }
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedTeam = [...formData.teamMembers];
    updatedTeam[index] = { ...updatedTeam[index], [field]: value };
    setFormData({ ...formData, teamMembers: updatedTeam });
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [...formData.teamMembers, { name: "", role: "", linkedin: "", avatar: "", bio: "" }]
    });
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter((_, i) => i !== index)
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "pitch") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const uploadData = new FormData();
    uploadData.append(type, file);

    try {
      const endpoint = type === "logo" ? "/api/startup/upload-logo" : "/api/startup/upload-pitch";
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth-storage") ? JSON.parse(localStorage.getItem("auth-storage")!).state.token : ""}`,
          "bypass-tunnel-reminder": "true"
        },
        body: uploadData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ 
          ...prev, 
          [type === "logo" ? "logo" : "pitchDeckUrl"]: data.url 
        }));
        toast.success(`${type === "logo" ? "Logo" : "Pitch Desk"} uploaded successfully`);
      } else {
        toast.error(data.message);
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
      const endpoint = mode === "create" ? "/api/startup/create" : "/api/startup/update";
      const response = await apiFetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Startup profile ${mode === "create" ? "created" : "updated"} successfully`);
        router.push("/startup/dashboard");
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto p-1 bg-zinc-100 rounded-xl overflow-x-auto">
          <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4 shadow-none"><Building2 className="h-4 w-4 mr-2" /> Basic</TabsTrigger>
          <TabsTrigger value="funding" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4 shadow-none"><Coins className="h-4 w-4 mr-2" /> Funding</TabsTrigger>
          <TabsTrigger value="product" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4 shadow-none"><Box className="h-4 w-4 mr-2" /> Product</TabsTrigger>
          <TabsTrigger value="market" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4 shadow-none"><Target className="h-4 w-4 mr-2" /> Market</TabsTrigger>
          <TabsTrigger value="traction" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4 shadow-none"><TrendingUp className="h-4 w-4 mr-2" /> Traction</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4 shadow-none"><Users className="h-4 w-4 mr-2" /> Team</TabsTrigger>
          <TabsTrigger value="pitch" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2 px-4 shadow-none"><FileUp className="h-4 w-4 mr-2" /> Pitch</TabsTrigger>
        </TabsList>

        <div className="mt-8">
          {/* Section 1: Basic Info */}
          <TabsContent value="basic" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>The core details of your startup venture.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="startupName">Startup Name</Label>
                        <Input id="startupName" required value={formData.startupName} onChange={handleChange} placeholder="Acme Tech" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input id="tagline" value={formData.tagline} onChange={handleChange} placeholder="Revolutionizing SaaS with AI" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea id="description" required className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={handleChange} rows={4} placeholder="Full description of your startup..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input id="industry" required value={formData.industry} onChange={handleChange} placeholder="Fintech" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stage">Stage</Label>
                        <select id="stage" className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm" value={formData.stage} onChange={handleChange}>
                            <option value="idea">Idea Stage</option>
                            <option value="MVP">MVP</option>
                            <option value="revenue">Revenue Generating</option>
                            <option value="growth">Growth Stage</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="foundedYear">Founded Year</Label>
                        <Input id="foundedYear" type="number" value={formData.foundedYear} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" required value={formData.location} onChange={handleChange} placeholder="Bangalore, India" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Startup Logo</Label>
                        <div className="flex items-center gap-4">
                            {formData.logo && <img src={formData.logo} alt="Logo" className="h-16 w-16 object-cover rounded-xl border border-zinc-200" />}
                            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} className="cursor-pointer" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab("funding")} className="bg-indigo-600 hover:bg-indigo-700">Next: Funding <Plus className="ml-2 h-4 w-4" /></Button>
            </div>
          </TabsContent>

          {/* Section 2: Funding */}
          <TabsContent value="funding" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Funding & Financials</CardTitle>
                    <CardDescription>Help investors understand your capital requirements.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="currency">Display Currency</Label>
                        <select id="currency" className="flex h-11 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-bold italic" value={formData.currency} onChange={handleChange}>
                            <option value="USD">$ USD</option>
                            <option value="EUR">€ EUR</option>
                            <option value="GBP">£ GBP</option>
                            <option value="INR">₹ INR</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fundingRequired">Funding Required</Label>
                        <Input id="fundingRequired" type="number" value={formData.fundingRequired} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fundingRaised">Funding Raised</Label>
                        <Input id="fundingRaised" type="number" value={formData.fundingRaised} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valuation">Current Valuation</Label>
                        <Input id="valuation" type="number" value={formData.valuation} onChange={handleChange} />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>Back</Button>
                <Button type="button" onClick={() => setActiveTab("product")} className="bg-indigo-600 hover:bg-indigo-700">Next: Product</Button>
            </div>
          </TabsContent>

          {/* Section 3: Product */}
          <TabsContent value="product" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Product & Solution</CardTitle>
                    <CardDescription>What problem are you solving?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="problemStatement">Problem Statement</Label>
                        <textarea id="problemStatement" className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.problemStatement} onChange={handleChange} rows={3} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="solution">Your Solution</Label>
                        <textarea id="solution" className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.solution} onChange={handleChange} rows={3} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="demoUrl">Demo Link (URL)</Label>
                            <Input id="demoUrl" value={formData.demoUrl} onChange={handleChange} placeholder="https://youtube.com/..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website Link</Label>
                            <Input id="website" value={formData.website} onChange={handleChange} placeholder="https://acme.com" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("funding")}>Back</Button>
                <Button type="button" onClick={() => setActiveTab("market")} className="bg-indigo-600 hover:bg-indigo-700">Next: Market</Button>
            </div>
          </TabsContent>

          {/* Section 4: Market */}
          <TabsContent value="market" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Market Analysis</CardTitle>
                    <CardDescription>Define your target market and competition.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="marketSize">Market Size (TAM/SAM/SOM)</Label>
                        <Input id="marketSize" value={formData.marketSize} onChange={handleChange} placeholder="$10B Total Addressable Market" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessModel">Business Model</Label>
                        <textarea id="businessModel" className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.businessModel} onChange={handleChange} rows={3} placeholder="How do you make money?" />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("product")}>Back</Button>
                <Button type="button" onClick={() => setActiveTab("traction")} className="bg-indigo-600 hover:bg-indigo-700">Next: Traction</Button>
            </div>
          </TabsContent>

          {/* Section 5: Traction */}
          <TabsContent value="traction" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Traction & Metrics</CardTitle>
                    <CardDescription>Show off your growth and user engagement.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="users">Total Active Users</Label>
                        <Input id="users" type="number" value={formData.users} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="revenue">Monthly Revenue</Label>
                        <Input id="revenue" type="number" value={formData.revenue} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="growthRate">Growth Rate (%)</Label>
                        <Input id="growthRate" value={formData.growthRate} onChange={handleChange} placeholder="15% MoM" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tractionMetrics">Other Key Metrics</Label>
                        <Input id="tractionMetrics" value={formData.tractionMetrics} onChange={handleChange} placeholder="70% retention, $5 CAC" />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("market")}>Back</Button>
                <Button type="button" onClick={() => setActiveTab("team")} className="bg-indigo-600 hover:bg-indigo-700">Next: Team</Button>
            </div>
          </TabsContent>

          {/* Section 6: Team */}
          <TabsContent value="team" className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Team Members</h3>
                <Button type="button" onClick={addTeamMember} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {formData.teamMembers.map((member, index) => (
                    <Card key={index} className="border-none shadow-sm relative overflow-hidden group">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeTeamMember(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Member Name</Label>
                                <Input value={member.name} onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)} placeholder="Full Name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input value={member.role} onChange={(e) => handleTeamMemberChange(index, "role", e.target.value)} placeholder="e.g. CEO & Founder" />
                            </div>
                            <div className="space-y-2">
                                <Label>LinkedIn Profile</Label>
                                <Input value={member.linkedin} onChange={(e) => handleTeamMemberChange(index, "linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Bio</Label>
                                <Input value={member.bio} onChange={(e) => handleTeamMemberChange(index, "bio", e.target.value)} placeholder="Short background..." />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("traction")}>Back</Button>
                <Button type="button" onClick={() => setActiveTab("pitch")} className="bg-indigo-600 hover:bg-indigo-700">Next: Pitch Deck</Button>
            </div>
          </TabsContent>

          {/* Section 7: Pitch Deck */}
          <TabsContent value="pitch" className="space-y-6">
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Pitch Deck (Required for Matching)</CardTitle>
                    <CardDescription>Upload your investment pitch deck (PDF or PPT preferred).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 hover:bg-zinc-100/50 transition-colors">
                        <FileUp className="h-12 w-12 text-zinc-400 mb-4" />
                        <p className="text-zinc-500 text-center mb-6">Drag and drop your deck here, or click to browse.</p>
                        <Input type="file" accept=".pdf,.ppt,.pptx" onChange={(e) => handleFileUpload(e, "pitch")} className="cursor-pointer max-w-xs" />
                    </div>
                    {formData.pitchDeckUrl && (
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex items-center gap-3">
                                <FileUp className="h-5 w-5 text-indigo-600" />
                                <span className="text-sm font-bold text-indigo-900">Pitch Deck Uploaded</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-indigo-600 font-bold" onClick={() => window.open(formData.pitchDeckUrl)}>View</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="flex justify-between items-center">
                <Button type="button" variant="outline" onClick={() => setActiveTab("team")}>Back</Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-bold shadow-lg shadow-indigo-100">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {mode === "create" ? "Launch Profile" : "Save Changes"}
                </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </form>
  );
}
