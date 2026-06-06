import { useTheme } from '../../contexts/useTheme';

// The iOS-style on/off switch.
const ToggleSwitch = ({ checked, onChange, title }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-indigo-600' : 'bg-gray-400'
    }`}
    title={title}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// A labelled setting row: title + description on the left, switch on the right.
export const SettingToggle = ({ label, description, checked, onChange }) => {
  const { classes } = useTheme();
  return (
    <div className={`flex items-center justify-between p-4 ${classes.inputBgPlain} rounded-lg`}>
      <div>
        <p className={`font-medium ${classes.textColor}`}>{label}</p>
        <p className={`text-sm ${classes.mutedText}`}>{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} title={label} />
    </div>
  );
};

export default ToggleSwitch;
