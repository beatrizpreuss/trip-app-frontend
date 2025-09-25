
export default function SaveButton( { saveChanges, hasChanges }) {
    return (
        <button
            onClick={saveChanges}
            className={`${hasChanges ? "bg-red-400 hover:bg-red-500" : "bg-zinc-900 hover:bg-zinc-800 dark:bg-[#dddddd]"} w-50 my-5 mr-5 
                    text-zinc-100 hover:font-bold focus:ring-4 focus:outline-none focus:ring-zinc-300 font-medium rounded-lg text-sm px-4 py-2 
                    text-center dark:hover:bg-zinc-200 dark:focus:ring-zinc-800 dark:text-zinc-800`}>
            Save Changes
        </button>
    )
}