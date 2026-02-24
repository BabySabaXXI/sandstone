"use client";

import React from "react";
import { z } from "zod";
import {
  Form,
  FormInput,
  FormTextarea,
  FormSelect,
  FormSwitch,
  FormFileUpload,
  FormActions,
  useForm,
  schemas,
  FileWithPreview,
} from "@/components/ui/form";

// ============================================================================
// Validation Schema
// ============================================================================

const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  website: schemas.url(false),
  location: z.string().max(100).optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  profileVisibility: z.enum(["public", "friends", "private"]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ============================================================================
// Timezone Options
// ============================================================================

const timezoneOptions = [
  { value: "", label: "Select timezone" },
  { value: "UTC-12", label: "UTC-12:00" },
  { value: "UTC-11", label: "UTC-11:00" },
  { value: "UTC-10", label: "UTC-10:00 (Hawaii)" },
  { value: "UTC-9", label: "UTC-09:00 (Alaska)" },
  { value: "UTC-8", label: "UTC-08:00 (Pacific)" },
  { value: "UTC-7", label: "UTC-07:00 (Mountain)" },
  { value: "UTC-6", label: "UTC-06:00 (Central)" },
  { value: "UTC-5", label: "UTC-05:00 (Eastern)" },
  { value: "UTC-4", label: "UTC-04:00" },
  { value: "UTC-3", label: "UTC-03:00" },
  { value: "UTC+0", label: "UTC+00:00 (London)" },
  { value: "UTC+1", label: "UTC+01:00 (Paris, Berlin)" },
  { value: "UTC+2", label: "UTC+02:00 (Cairo, Johannesburg)" },
  { value: "UTC+3", label: "UTC+03:00 (Moscow)" },
  { value: "UTC+4", label: "UTC+04:00 (Dubai)" },
  { value: "UTC+5:30", label: "UTC+05:30 (India)" },
  { value: "UTC+8", label: "UTC+08:00 (Singapore, Beijing)" },
  { value: "UTC+9", label: "UTC+09:00 (Tokyo)" },
  { value: "UTC+10", label: "UTC+10:00 (Sydney)" },
  { value: "UTC+12", label: "UTC+12:00 (Auckland)" },
];

// ============================================================================
// Profile Form Component
// ============================================================================

interface ProfileFormProps {
  /** Initial profile data */
  initialData?: Partial<ProfileFormData>;
  /** Current avatar URL */
  currentAvatar?: string;
  /** Callback when form is submitted */
  onSubmit: (data: ProfileFormData, avatar?: FileWithPreview[]) => Promise<void>;
  /** Callback when user cancels */
  onCancel?: () => void;
}

/**
 * ProfileForm - A complete profile editing form
 * 
 * Features:
 * - Avatar upload with preview
 * - Display name and bio
 * - Website and location
 * - Timezone selection
 * - Notification preferences
 * - Privacy settings
 * - Loading state
 * - Error handling
 */
export function ProfileForm({
  initialData,
  currentAvatar,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const [avatar, setAvatar] = React.useState<FileWithPreview[]>([]);

  const form = useForm<ProfileFormData>({
    initialValues: {
      displayName: "",
      bio: "",
      website: "",
      location: "",
      timezone: "",
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      profileVisibility: "public",
      ...initialData,
    },
    validationSchema: profileSchema,
    onSubmit: async (data) => {
      await onSubmit(data, avatar.length > 0 ? avatar : undefined);
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const fieldLabels = {
    displayName: "Display name",
    bio: "Bio",
    website: "Website",
    location: "Location",
    timezone: "Timezone",
    emailNotifications: "Email notifications",
    pushNotifications: "Push notifications",
    marketingEmails: "Marketing emails",
    profileVisibility: "Profile visibility",
  };

  return (
    <Form
      errors={form.errors}
      isSubmitting={form.isSubmitting}
      touched={Object.keys(form.touched).length > 0}
      onSubmit={form.handleSubmit}
      fieldLabels={fieldLabels}
      className="w-full max-w-2xl"
    >
      {/* Avatar Upload */}
      <div className="flex items-start gap-6">
        <FormFileUpload
          label="Profile Photo"
          accept="image/*"
          maxSize={5 * 1024 * 1024} // 5MB
          maxFiles={1}
          value={avatar}
          onChange={setAvatar}
          variant="avatar"
          dropzoneText="Drop photo or click"
          showFileList={false}
          helperText="Max 5MB, JPG/PNG"
          isLoading={form.isSubmitting}
        />
        
        {currentAvatar && avatar.length === 0 && (
          <div className="flex flex-col items-center">
            <img
              src={currentAvatar}
              alt="Current avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
            <span className="text-xs text-muted-foreground mt-2">Current</span>
          </div>
        )}
      </div>

      {/* Display Name */}
      <FormInput
        label="Display name"
        placeholder="How you want to be known"
        required
        value={form.values.displayName}
        onChange={(e) => form.setValue("displayName", e.target.value)}
        onBlur={form.handleBlur("displayName")}
        error={form.errors.displayName}
        touched={form.touched.displayName}
        isLoading={form.isSubmitting}
      />

      {/* Bio */}
      <FormTextarea
        label="Bio"
        placeholder="Tell us about yourself..."
        rows={4}
        maxLength={500}
        showCharacterCount
        autoResize
        value={form.values.bio}
        onChange={(e) => form.setValue("bio", e.target.value)}
        onBlur={form.handleBlur("bio")}
        error={form.errors.bio}
        touched={form.touched.bio}
        isLoading={form.isSubmitting}
      />

      {/* Website */}
      <FormInput
        label="Website"
        type="url"
        placeholder="https://yourwebsite.com"
        leftElement={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        }
        value={form.values.website}
        onChange={(e) => form.setValue("website", e.target.value)}
        onBlur={form.handleBlur("website")}
        error={form.errors.website}
        touched={form.touched.website}
        isLoading={form.isSubmitting}
      />

      {/* Location */}
      <FormInput
        label="Location"
        placeholder="City, Country"
        leftElement={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        value={form.values.location}
        onChange={(e) => form.setValue("location", e.target.value)}
        onBlur={form.handleBlur("location")}
        error={form.errors.location}
        touched={form.touched.location}
        isLoading={form.isSubmitting}
      />

      {/* Timezone */}
      <FormSelect
        label="Timezone"
        options={timezoneOptions}
        placeholder="Select your timezone"
        value={form.values.timezone}
        onChange={(e) => form.setValue("timezone", e.target.value)}
        onBlur={form.handleBlur("timezone")}
        error={form.errors.timezone}
        touched={form.touched.timezone}
        isLoading={form.isSubmitting}
      />

      {/* Section Divider */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>

        <div className="space-y-4">
          {/* Email Notifications */}
          <FormSwitch
            label="Email notifications"
            description="Receive notifications about your account activity"
            checked={form.values.emailNotifications}
            onChange={(e) => form.setValue("emailNotifications", e.target.checked)}
            isLoading={form.isSubmitting}
          />

          {/* Push Notifications */}
          <FormSwitch
            label="Push notifications"
            description="Receive push notifications in your browser"
            checked={form.values.pushNotifications}
            onChange={(e) => form.setValue("pushNotifications", e.target.checked)}
            isLoading={form.isSubmitting}
          />

          {/* Marketing Emails */}
          <FormSwitch
            label="Marketing emails"
            description="Receive updates about new features and promotions"
            checked={form.values.marketingEmails}
            onChange={(e) => form.setValue("marketingEmails", e.target.checked)}
            isLoading={form.isSubmitting}
          />
        </div>
      </div>

      {/* Section Divider */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>

        {/* Profile Visibility */}
        <FormSelect
          label="Profile visibility"
          required
          options={[
            { value: "public", label: "Public - Anyone can see your profile" },
            { value: "friends", label: "Friends only - Only friends can see your profile" },
            { value: "private", label: "Private - Only you can see your profile" },
          ]}
          value={form.values.profileVisibility}
          onChange={(e) => form.setValue("profileVisibility", e.target.value as ProfileFormData["profileVisibility"])}
          onBlur={form.handleBlur("profileVisibility")}
          error={form.errors.profileVisibility}
          touched={form.touched.profileVisibility}
          isLoading={form.isSubmitting}
        />
      </div>

      <FormActions
        isSubmitting={form.isSubmitting}
        isDirty={form.isDirty}
        submitText="Save Changes"
        showCancel={!!onCancel}
        onCancel={onCancel}
        align="between"
      />
    </Form>
  );
}

export default ProfileForm;
