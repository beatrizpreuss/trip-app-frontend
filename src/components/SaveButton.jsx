
export default function SaveButton({ saveChanges, hasChanges }) {
    return (
        <button
            onClick={saveChanges}
            className={`relative my-5 general-button`}
        >
            {/* The dot */}
            {hasChanges && (
                <span className="absolute right-5 w-5 h-5 bg-[var(--color-pastel-orange)] rounded-full shadow-lg"></span>
            )}
            Save Changes
        </button>
    )
}