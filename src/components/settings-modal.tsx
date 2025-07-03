"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  User, 
  Crown, 
  Bell, 
  Shield, 
  Download,
  Mail,
  Calendar,
  Trash2
} from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: session } = useSession()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [autoOptimization, setAutoOptimization] = useState(false)
  const [dataRetention, setDataRetention] = useState(true)

  const isPremium = session?.user?.plan === "PREMIUM"
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Information */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Full Name</Label>
                  <Input 
                    value={session?.user?.name || ''} 
                    className="bg-slate-800/50 border-slate-600 text-white"
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input 
                    value={session?.user?.email || ''} 
                    className="bg-slate-800/50 border-slate-600 text-white"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Plan Status</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={isPremium ? "default" : "secondary"}
                    className={isPremium ? "bg-purple-600 text-white" : "bg-slate-600 text-slate-200"}
                  >
                    {isPremium ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Premium Plan
                      </>
                    ) : (
                      "Free Plan"
                    )}
                  </Badge>
                  <span className="text-sm text-slate-400">
                    Member since {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage how we communicate with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300">Email Notifications</Label>
                  <p className="text-sm text-slate-400">Resume processing updates and tips</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300">Auto-Optimization Alerts</Label>
                  <p className="text-sm text-slate-400">Get notified when AI finds improvements</p>
                </div>
                <Switch 
                  checked={autoOptimization}
                  onCheckedChange={setAutoOptimization}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy & Data
              </CardTitle>
              <CardDescription className="text-slate-400">
                Control your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300">Data Retention</Label>
                  <p className="text-sm text-slate-400">Keep resume data for faster processing</p>
                </div>
                <Switch 
                  checked={dataRetention}
                  onCheckedChange={setDataRetention}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-2">
                <Label className="text-slate-300">Export Your Data</Label>
                <p className="text-sm text-slate-400 mb-2">Download all your resume data and settings</p>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage & Billing */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Usage & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-sm text-slate-400">Resumes Created</p>
                  <p className="text-xl font-bold text-white">3 / {isPremium ? '∞' : '3'}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-sm text-slate-400">This Month</p>
                  <p className="text-xl font-bold text-white">3</p>
                </div>
              </div>
              {!isPremium && (
                <div className="p-4 bg-purple-900/20 border border-purple-400/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-medium">Upgrade to Premium</span>
                  </div>
                  <p className="text-sm text-purple-200 mb-3">
                    Get unlimited resumes, advanced AI optimization, and priority support
                  </p>
                  <Button className="btn-gradient w-full">
                    Upgrade Now - $8.99/month
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="glass-card border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-slate-400">
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-red-500/20 rounded-lg bg-red-900/10">
                <h4 className="text-red-400 font-medium mb-2">Delete Account</h4>
                <p className="text-sm text-slate-400 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:bg-slate-700">
            Cancel
          </Button>
          <Button className="btn-gradient">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}