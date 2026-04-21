"use client";

import { FundingLedger } from "@/components/FundingLedger";
import { MapView } from "@/components/MapView";
import { Timeline } from "@/components/Timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VolunteerList } from "@/components/VolunteerList";
import { useAuth } from "@/context/AuthContext";
import api, { assetUrl } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Bot, CheckCircle, DollarSign, Flag, Hand, Loader2, RotateCcw, ThumbsUp, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const statusColors: Record<string, string> = {
  reported: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
};

export default function IssueDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skillsModal, setSkillsModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseReceipt, setExpenseReceipt] = useState<File | null>(null);
  const [fundingKey, setFundingKey] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);

  useEffect(() => {
    api
      .get(`/issues/${id}`)
      .then((res) => setIssue(res.data.issue))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpvote = async () => {
    const { data } = await api.post(`/issues/${id}/upvote`);
    setIssue((prev: any) => ({ ...prev, upvotes: data.upvotes }));
  };

  const handleVolunteer = async () => {
    if (selectedSkills.length === 0) return setSkillsModal(true);
    const { data } = await api.post(`/issues/${id}/volunteer`, {
      skills: selectedSkills,
    });
    setIssue((prev: any) => ({ ...prev, volunteers: data.volunteers }));
    setSkillsModal(false);
    setSelectedSkills([]);
  };

  const handleFlag = async () => {
    const reason = prompt("Why are you flagging this issue?");
    if (!reason) return;
    await api.post(`/issues/${id}/flag`, { reason });
    setIssue((prev: any) => ({ ...prev, flags: (prev.flags || 0) + 1 }));
  };

  const handleStatusUpdate = async (newStatus: string) => {
    const formData = new FormData();
    formData.append("status", newStatus);

    if (newStatus === "resolved") {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = "image/*";
      input.onchange = async () => {
        const files = input.files;
        if (!files) return;
        Array.from(files).forEach((f) => formData.append("afterPhotos", f));
        const { data } = await api.patch(`/issues/${id}/status`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setIssue(data.issue);
        setShowVerifyPrompt(true);
      };
      input.click();
      return;
    }

    const { data } = await api.patch(`/issues/${id}/status`, formData);
    setIssue(data.issue);
  };

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) return;
    await api.post(`/issues/${id}/fund`, { amount: donateAmount });
    setDonateAmount('');
    setShowDonateForm(false);
    setFundingKey((k) => k + 1);
  };

  const handleExpense = async () => {
    if (!expenseAmount || parseFloat(expenseAmount) <= 0 || !expenseDesc) return;
    const formData = new FormData();
    formData.append('amount', expenseAmount);
    formData.append('description', expenseDesc);
    if (expenseReceipt) formData.append('receipt', expenseReceipt);
    await api.post(`/issues/${id}/expense`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setExpenseAmount('');
    setExpenseDesc('');
    setExpenseReceipt(null);
    setShowExpenseForm(false);
    setFundingKey((k) => k + 1);
  };

  const handleVerify = async () => {
    setVerifying(true);
    const { data } = await api.post(`/issues/${id}/verify`);
    setIssue((prev: any) => ({ ...prev, aiVerification: data.verification }));
    setVerifying(false);
    setShowVerifyPrompt(false);
  };

  const handleRevertToInProgress = async () => {
    const formData = new FormData();
    formData.append("status", "in_progress");
    const { data } = await api.patch(`/issues/${id}/status`, formData);
    setIssue(data.issue);
    setShowVerifyPrompt(false);
  };

  if (loading)
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse">
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    );
  if (!issue)
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">Issue not found</div>
    );

  const canUpdateStatus =
    user &&
    (String(issue.reporter) === String(user.id) ||
      issue.volunteers.some((v: any) => String(v.user) === String(user.id)));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">{issue.title}</h1>
              <Badge className={statusColors[issue.status]}>
                {issue.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {issue.category} • Reported by {issue.reporterName}
            </p>
          </div>

          {issue.description && <p>{issue.description}</p>}

          <div>
            <h3 className="font-semibold mb-2">Photos</h3>
            <div className="grid grid-cols-2 gap-2">
              {issue.photos.map((photo: string, i: number) => (
                <img
                  key={i}
                  src={assetUrl(photo)}
                  alt={`Before ${i}`}
                  className="rounded-lg w-full h-48 object-cover"
                />
              ))}
            </div>
          </div>

          {issue.afterPhotos?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">After Photos</h3>
              <div className="grid grid-cols-2 gap-2">
                {issue.afterPhotos.map((photo: string, i: number) => (
                  <img
                    key={i}
                    src={assetUrl(photo)}
                    alt={`After ${i}`}
                    className="rounded-lg w-full h-48 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {showVerifyPrompt && !issue.aiVerification?.result && (
            <div className="border-2 border-blue-300 bg-blue-50 rounded-xl p-6 text-center space-y-4">
              <Bot className="h-10 w-10 mx-auto text-blue-600" />
              <h3 className="text-lg font-bold">Verify the Fix with AI</h3>
              <p className="text-sm text-muted-foreground">
                Our AI will compare the before and after photos to confirm the issue has been resolved.
              </p>
              <Button
                onClick={handleVerify}
                disabled={verifying}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base"
                size="lg"
              >
                {verifying ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Analyzing Photos...</>
                ) : (
                  <><Bot className="h-5 w-5 mr-2" /> Run AI Verification</>
                )}
              </Button>
            </div>
          )}

          {issue.aiVerification?.result === "verified" && (
            <div className="border-2 border-green-300 bg-green-50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-lg font-bold text-green-800">AI Verification: Fix Confirmed</span>
              </div>
              <p className="text-sm">{issue.aiVerification.explanation}</p>
              {issue.aiVerification.confidence > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Confidence: {issue.aiVerification.confidence}%
                </p>
              )}
            </div>
          )}

          {issue.aiVerification?.result === "uncertain" && (
            <div className="border-2 border-yellow-300 bg-yellow-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <span className="text-lg font-bold text-yellow-800">AI Could Not Confirm Fix</span>
              </div>
              <p className="text-sm">{issue.aiVerification.explanation}</p>
              {issue.aiVerification.confidence > 0 && (
                <p className="text-xs text-muted-foreground">
                  Confidence: {issue.aiVerification.confidence}%
                </p>
              )}
              {canUpdateStatus && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRevertToInProgress}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Revert to In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.accept = "image/*";
                      input.onchange = async () => {
                        const files = input.files;
                        if (!files) return;
                        const formData = new FormData();
                        formData.append("status", "resolved");
                        Array.from(files).forEach((f) => formData.append("afterPhotos", f));
                        const { data } = await api.patch(`/issues/${id}/status`, formData, {
                          headers: { "Content-Type": "multipart/form-data" },
                        });
                        setIssue({ ...data.issue, aiVerification: undefined });
                        setShowVerifyPrompt(true);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Re-upload After Photos
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="h-[200px]">
            <MapView
              issues={[
                {
                  _id: issue._id,
                  title: issue.title,
                  latitude: issue.latitude,
                  longitude: issue.longitude,
                  status: issue.status,
                  category: issue.category,
                },
              ]}
              center={[issue.latitude, issue.longitude]}
              zoom={15}
              className="h-[200px]"
            />
          </div>

          <Timeline events={issue.timeline || []} />
        </div>

        <div className="space-y-6">
          {isAuthenticated && (
            <div className="space-y-2">
              <Button
                onClick={handleUpvote}
                variant="outline"
                className="w-full"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Upvote ({issue.upvotes})
              </Button>
              <Button
                onClick={() => setSkillsModal(true)}
                variant="outline"
                className="w-full"
              >
                <Hand className="h-4 w-4 mr-2" />
                Volunteer
              </Button>
              <Button
                onClick={handleFlag}
                variant="ghost"
                size="sm"
                className="w-full text-orange-600"
              >
                <Flag className="h-4 w-4 mr-2" />
                Flag ({issue.flags || 0})
              </Button>

              {canUpdateStatus && issue.status !== "resolved" && (
                <div className="border-t pt-3 space-y-2">
                  {issue.status === "reported" && (
                    <Button
                      onClick={() => handleStatusUpdate("in_progress")}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Mark In Progress
                    </Button>
                  )}
                  <Button
                    onClick={() => handleStatusUpdate("resolved")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                </div>
              )}

              {issue.status === "resolved" &&
                issue.afterPhotos?.length > 0 &&
                !issue.aiVerification?.result &&
                !showVerifyPrompt && (
                  <Button
                    onClick={() => setShowVerifyPrompt(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Verify with AI
                  </Button>
                )}
            </div>
          )}

          {skillsModal && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Select your skills</h4>
              {["labor", "transport", "technical", "funding"].map((skill) => (
                <label key={skill} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedSkills([...selectedSkills, skill]);
                      else
                        setSelectedSkills(
                          selectedSkills.filter((s) => s !== skill),
                        );
                    }}
                  />
                  {skill}
                </label>
              ))}
              <Button
                size="sm"
                onClick={handleVolunteer}
                disabled={selectedSkills.length === 0}
              >
                Confirm
              </Button>
            </div>
          )}

          <VolunteerList volunteers={issue.volunteers || []} />
          <FundingLedger key={fundingKey} issueId={issue._id} />

          {isAuthenticated && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => { setShowDonateForm(!showDonateForm); setShowExpenseForm(false); }}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Donate
                </Button>
                {canUpdateStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setShowExpenseForm(!showExpenseForm); setShowDonateForm(false); }}
                  >
                    Log Expense
                  </Button>
                )}
              </div>

              {showDonateForm && (
                <div className="border rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-semibold">Donate to this issue</h4>
                  <Input
                    type="number"
                    placeholder="Amount (Rs.)"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    min="1"
                  />
                  <Button size="sm" className="w-full" onClick={handleDonate} disabled={!donateAmount}>
                    Confirm Donation
                  </Button>
                </div>
              )}

              {showExpenseForm && (
                <div className="border rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-semibold">Log an expense</h4>
                  <Input
                    type="number"
                    placeholder="Amount (Rs.)"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    min="1"
                  />
                  <Input
                    placeholder="Description"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                  />
                  <label className="block text-xs text-muted-foreground">
                    Receipt (optional)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setExpenseReceipt(e.target.files?.[0] || null)}
                      className="block w-full mt-1 text-sm"
                    />
                  </label>
                  <Button size="sm" className="w-full" onClick={handleExpense} disabled={!expenseAmount || !expenseDesc}>
                    Submit Expense
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
