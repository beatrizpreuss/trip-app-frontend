
export default function SaveButton( { saveChanges, hasChanges }) {
    return (
        <button
            onClick={saveChanges}
            className={`${hasChanges ? "bg-[var(--color-crimson)] hover:bg-[var(--color-pastel-orange)]" : "bg-[var(--color-dark-azure)] hover:bg-zinc-800 dark:bg-[#dddddd]"} my-5 
                    general-button`}>
            Save Changes
        </button>
    )
}