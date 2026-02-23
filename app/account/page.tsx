"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { authService } from "@/services/auth.service"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  User as UserIcon,
  Bell,
  Shield,
  Key,
  Smartphone,
  Save,
  CheckCircle2,
  Upload,
  Globe,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const MAX_AVATAR_SIZE_MB = 5
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

export default function AccountPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState(tabParam || "profile")
  const { user, refreshUser, setUserFromProfile, getAvatarUrl } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam)
  }, [tabParam])

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
      })
    }
  }, [user])

  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : ""
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? "?").toUpperCase()

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    try {
      await authService.updateProfile({
        firstName: profile.firstName.trim() || undefined,
        lastName: profile.lastName.trim() || undefined,
        email: profile.email.trim() || undefined,
        phone: profile.phone.trim() || undefined,
        bio: profile.bio.trim() || undefined,
        location: profile.location.trim() || undefined,
      })
      await refreshUser()
      toast({ title: "Profile saved", description: "Your changes have been saved." })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save profile."
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleUploadPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: "Invalid file", description: "Please choose a JPG, PNG, GIF or WebP image.", variant: "destructive" })
      e.target.value = ""
      return
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast({ title: "File too large", description: `Max size is ${MAX_AVATAR_SIZE_MB}MB.`, variant: "destructive" })
      e.target.value = ""
      return
    }
    setAvatarUploading(true)
    try {
      const updatedUser = await authService.uploadAvatar(file)
      setUserFromProfile(updatedUser)
      toast({ title: "Photo updated", description: "Your profile photo has been updated." })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload photo."
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setAvatarUploading(false)
      e.target.value = ""
    }
  }

  const handleRemovePhoto = async () => {
    setAvatarUploading(true)
    try {
      const updatedUser = await authService.updateProfile({ avatar: null })
      setUserFromProfile(updatedUser)
      toast({ title: "Photo removed", description: "Your profile photo has been removed." })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove photo."
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="min-h-screen animated-gradient-bg flex">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-chart-4/10 blur-[100px] animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      <main
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out w-full",
          "pl-0 lg:pl-64",
          sidebarCollapsed && "lg:pl-20"
        )}
      >
        <div className="px-4 lg:px-8 py-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Account settings</h1>
                <p className="text-sm text-muted-foreground">
                  Profile, security, notifications, and account preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-8 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="glass rounded-xl p-2">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-transparent">
                <TabsTrigger value="profile" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="gap-2">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="space-y-6">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your photo and personal details here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 ring-4 ring-background">
                      <AvatarImage src={getAvatarUrl() ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={handleUploadPhoto}
                          disabled={avatarUploading}
                        >
                          <Upload className="h-4 w-4" />
                          {avatarUploading ? "Uploading…" : "Upload new photo"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-destructive"
                          onClick={handleRemovePhoto}
                          disabled={avatarUploading || !user?.avatar}
                        >
                          Remove
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, GIF or WebP. Max size of 5MB.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={profile.firstName}
                        onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                        className="glass-subtle border-glass-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={profile.lastName}
                        onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                        className="glass-subtle border-glass-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className="glass-subtle border-glass-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="glass-subtle border-glass-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={profile.bio}
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      className="glass-subtle border-glass-border min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={profile.location}
                      onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                      className="glass-subtle border-glass-border"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => user && setProfile({
                        firstName: user.firstName ?? "",
                        lastName: user.lastName ?? "",
                        email: user.email ?? "",
                        phone: user.phone ?? "",
                        bio: user.bio ?? "",
                        location: user.location ?? "",
                      })}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="gap-2"
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                    >
                      <Save className="h-4 w-4" />
                      {profileSaving ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Choose what updates you want to receive via email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when tasks are assigned or updated
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Activity</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about project changes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Team Mentions</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone mentions you
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Deadline Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders about upcoming deadlines
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Get a weekly digest of your activity
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>
                    Manage notifications on your devices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Desktop Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications on your desktop
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mobile Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on mobile devices
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      className="glass-subtle border-glass-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="glass-subtle border-glass-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="glass-subtle border-glass-border"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg glass-subtle">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Authenticator App</p>
                        <p className="text-sm text-muted-foreground">
                          Use an authenticator app to get verification codes
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-status-done/10 text-status-done border-status-done/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Configure 2FA
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage your active sessions across devices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg glass-subtle">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">MacBook Pro • San Francisco, CA</p>
                        <p className="text-xs text-muted-foreground">
                          Active now • Chrome on macOS
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg glass-subtle">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">iPhone 13 • San Francisco, CA</p>
                        <p className="text-xs text-muted-foreground">
                          2 hours ago • Safari on iOS
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Revoke</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    View your account details and subscription.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <p className="font-medium">Professional</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      Active
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">January 15, 2023</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                    <p className="font-medium">2.4 GB of 10 GB</p>
                    <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "24%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-glass-border">
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>
                    Download a copy of your data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Request Data Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-glass-border border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Delete Account</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete My Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
