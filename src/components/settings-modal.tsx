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
  Trash2,
  Settings,
  Sparkles,
  CheckCircle
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
      <DialogContent className="bg-slate-800/40 backdrop-blur-xl border border-white/20 max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="gradient-text">
              Account Settings
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Information */}
          <Card className="glass-card hover:scale-[1.01] transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Full Name</Label>
                  <Input 
                    value={session?.user?.name || ''} 
                    className="bg-slate-800/50 border-slate-600 text-white hover:border-cyan-400/50 focus:border-cyan-400 transition-colors"
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Email</Label>
                  <Input 
                    value={session?.user?.email || ''} 
                    className="bg-slate-800/50 border-slate-600 text-white hover:border-cyan-400/50 focus:border-cyan-400 transition-colors"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Plan Status</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    className={isPremium 
                      ? "btn-gradient text-white border-0 hover:scale-105 transition-transform" 
                      : "bg-slate-600 text-slate-200 hover:scale-105 transition-transform"
                    }
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
                    Member Since {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-card hover:scale-[1.01] transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
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
          <Card className="glass-card hover:scale-[1.01] transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
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
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:scale-105 transition-all">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage & Billing */}
          <Card className="glass-card hover:scale-[1.01] transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Usage & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <p className="text-sm text-slate-400">Resumes Created</p>
                  <p className="text-xl font-bold text-white">3 / {isPremium ? '∞' : '3'}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <p className="text-sm text-slate-400">This Month</p>
                  <p className="text-xl font-bold text-white">3</p>
                </div>
              </div>
              {!isPremium && (
                <div className="p-4 bg-gradient-to-br from-purple-900/30 to-cyan-900/20 border border-purple-400/30 rounded-lg hover:scale-[1.02] transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="gradient-text font-medium">Upgrade to Premium</span>
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                  </div>
                  
                  {/* Premium Features Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    {[
                      "Unlimited Resumes",
                      "Advanced AI Optimization", 
                      "Premium Templates",
                      "Priority Support"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full btn-gradient text-white py-2 px-4 rounded-lg font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                    <span className="relative z-10">Upgrade Now - $8.99/month</span>
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="glass-card border-red-500/20 hover:scale-[1.01] transition-all duration-300">
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
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 hover:scale-105 transition-all">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:bg-slate-700 hover:scale-105 transition-all">
            Cancel
          </Button>
          <button className="px-4 py-2 btn-gradient text-white rounded-lg font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            <span className="relative z-10">Save Changes</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}