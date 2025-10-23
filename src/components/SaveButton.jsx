
export default function SaveButton( { saveChanges, hasChanges }) {
    return (
        <button
            onClick={saveChanges}
            className={`${hasChanges ? "bg-red-400 hover:bg-red-500" : "bg-zinc-900 hover:bg-zinc-800 dark:bg-[#dddddd]"} my-5 mr-5 
                    general-button`}>
            Save Changes
        </button>
    )
}