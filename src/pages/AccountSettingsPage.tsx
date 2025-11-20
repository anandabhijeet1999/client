import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { updateUserProfile, updateUserPassword, fetchCurrentUser } from "../features/auth/authSlice";

const AccountSettingsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    profileImage: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), "yyyy-MM-dd") : "",
        profileImage: user.profileImage || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="account-settings-page">
        <div className="account-loading">
          <p>Loading account settings...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field: string) => {
    try {
      if (field === "password") {
        if (formData.newPassword !== formData.confirmPassword) {
          alert("New passwords do not match");
          return;
        }
        await dispatch(
          updateUserPassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        ).unwrap();
        alert("Password updated successfully");
        setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        const updateData: any = {};
        if (field === "name") updateData.name = formData.name;
        if (field === "email") updateData.email = formData.email;
        if (field === "phone") updateData.phone = formData.phone || null;
        if (field === "address") updateData.address = formData.address || null;
        if (field === "dateOfBirth") updateData.dateOfBirth = formData.dateOfBirth || null;
        if (field === "profileImage") updateData.profileImage = formData.profileImage || null;

        await dispatch(updateUserProfile(updateData)).unwrap();
      }
      setEditingField(null);
    } catch (error: any) {
      alert(error.message || "Failed to update");
    }
  };

  const handleCancel = (field: string) => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        [field]: user[field as keyof typeof user] || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
    setEditingField(null);
  };

  return (
    <div className="account-settings-page">
      <div className="account-settings-container">
        {/* Profile Summary Section */}
        <div className="profile-summary">
          <div className="profile-picture-wrapper">
            <div className="profile-picture">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="profile-picture__image" />
              ) : (
                <span className="profile-picture__initials">{getInitials(user.name)}</span>
              )}
            </div>
            <button 
              type="button" 
              className="profile-picture-edit" 
              onClick={() => setEditingField("profileImage")}
              aria-label="Edit profile picture"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <h1 className="profile-summary__name">{user.name}</h1>
          <p className="profile-summary__email">{user.email}</p>
        </div>

        {/* Account Details Section */}
        <section className="account-details">
          <h2 className="account-details__title">Account</h2>

          {/* Name Field */}
          <AccountField
            label="Name"
            value={formData.name}
            isEditing={editingField === "name"}
            onEdit={() => setEditingField("name")}
            onSave={() => handleSave("name")}
            onCancel={() => handleCancel("name")}
            onChange={(value) => handleFieldChange("name", value)}
            inputType="text"
          />

          {/* Email Field */}
          <AccountField
            label="Email"
            value={formData.email}
            isEditing={editingField === "email"}
            onEdit={() => setEditingField("email")}
            onSave={() => handleSave("email")}
            onCancel={() => handleCancel("email")}
            onChange={(value) => handleFieldChange("email", value)}
            inputType="email"
            showAddAnother={true}
          />

          {/* Password Field */}
          <AccountField
            label="Password"
            value="************"
            isEditing={editingField === "password"}
            onEdit={() => setEditingField("password")}
            onSave={() => handleSave("password")}
            onCancel={() => handleCancel("password")}
            onChange={() => {}}
            inputType="password"
            isPassword={true}
            passwordFormData={formData}
            onPasswordChange={handleFieldChange}
          />

          {/* Phone Number Field */}
          <AccountField
            label="Phone number"
            value={formData.phone || "+1 000-000-0000"}
            isEditing={editingField === "phone"}
            onEdit={() => setEditingField("phone")}
            onSave={() => handleSave("phone")}
            onCancel={() => handleCancel("phone")}
            onChange={(value) => handleFieldChange("phone", value)}
            inputType="tel"
          />

          {/* Address Field */}
          <AccountField
            label="Address"
            value={formData.address || "St 32 main downtown, Los Angeles, California, USA"}
            isEditing={editingField === "address"}
            onEdit={() => setEditingField("address")}
            onSave={() => handleSave("address")}
            onCancel={() => handleCancel("address")}
            onChange={(value) => handleFieldChange("address", value)}
            inputType="text"
          />

          {/* Date of Birth Field */}
          <AccountField
            label="Date of birth"
            value={formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "dd-MM-yyyy") : user.dateOfBirth ? format(new Date(user.dateOfBirth), "dd-MM-yyyy") : "01-01-1992"}
            isEditing={editingField === "dateOfBirth"}
            onEdit={() => setEditingField("dateOfBirth")}
            onSave={() => handleSave("dateOfBirth")}
            onCancel={() => handleCancel("dateOfBirth")}
            onChange={(value) => handleFieldChange("dateOfBirth", value)}
            inputType="date"
            hideChangeButton={true}
            displayValue={formData.dateOfBirth}
          />

          {/* Profile Image Field */}
          {editingField === "profileImage" && (
            <AccountField
              label="Profile Image URL"
              value={formData.profileImage}
              isEditing={true}
              onEdit={() => {}}
              onSave={() => handleSave("profileImage")}
              onCancel={() => handleCancel("profileImage")}
              onChange={(value) => handleFieldChange("profileImage", value)}
              inputType="url"
              placeholder="Enter image URL"
            />
          )}
        </section>
      </div>
    </div>
  );
};

interface AccountFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  inputType: string;
  showAddAnother?: boolean;
  isPassword?: boolean;
  passwordFormData?: any;
  onPasswordChange?: (field: string, value: string) => void;
  hideChangeButton?: boolean;
  displayValue?: string;
  placeholder?: string;
}

const AccountField = ({
  label,
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  inputType,
  showAddAnother,
  isPassword,
  passwordFormData,
  onPasswordChange,
  hideChangeButton,
  displayValue,
  placeholder,
}: AccountFieldProps) => {
  if (isEditing && isPassword && passwordFormData && onPasswordChange) {
    return (
      <div className="account-field account-field--editing">
        <div className="account-field__label">{label}</div>
        <div className="account-field__value">
          <div className="account-field__password-inputs">
            <input
              type="password"
              placeholder="Current password"
              value={passwordFormData.currentPassword}
              onChange={(e) => onPasswordChange("currentPassword", e.target.value)}
              className="account-field__input"
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordFormData.newPassword}
              onChange={(e) => onPasswordChange("newPassword", e.target.value)}
              className="account-field__input"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordFormData.confirmPassword}
              onChange={(e) => onPasswordChange("confirmPassword", e.target.value)}
              className="account-field__input"
            />
          </div>
        </div>
        <div className="account-field__actions">
          <button type="button" className="account-field__button account-field__button--save" onClick={onSave}>
            <CheckIcon />
            Save
          </button>
          <button type="button" className="account-field__button account-field__button--cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="account-field account-field--editing">
        <div className="account-field__label">{label}</div>
        <div className="account-field__value">
          <input
            type={inputType}
            value={displayValue !== undefined ? displayValue : value}
            onChange={(e) => onChange(e.target.value)}
            className="account-field__input"
            placeholder={placeholder}
            autoFocus
          />
        </div>
        <div className="account-field__actions">
          <button type="button" className="account-field__button account-field__button--save" onClick={onSave}>
            <CheckIcon />
            Save
          </button>
          <button type="button" className="account-field__button account-field__button--cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-field">
      <div className="account-field__label">{label}</div>
      <div className="account-field__value">{value}</div>
      <div className="account-field__actions">
        {!hideChangeButton && (
          <button type="button" className="account-field__button account-field__button--change" onClick={onEdit}>
            <CheckIcon />
            Change
          </button>
        )}
        {showAddAnother && (
          <button type="button" className="account-field__button account-field__button--add" onClick={onEdit}>
            <PlusIcon />
            Add another email
          </button>
        )}
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
  </svg>
);

export default AccountSettingsPage;

