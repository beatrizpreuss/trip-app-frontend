import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export default function ExportPDF({ stays, eatDrink, explore, essentials, gettingAround }) {

    function generatePDF() {
        const doc = new jsPDF()
        let currentY = 15; // manual Y-tracking

        // Collect all days from all entries
        const allDays = [
            ...stays.flatMap(s => s.day),
            ...eatDrink.flatMap(e => e.day),
            ...explore.flatMap(ex => ex.day),
            ...essentials.flatMap(es => es.day),
            ...gettingAround.flatMap(g => g.day)
        ]

        const uniqueDays = [...new Set(allDays)].sort((a, b) => a - b)

        function matchDay(item, day) {
            return item.day.map(Number).includes(Number(day))
        }

        function printCategory(title, head, rows) {
            if (rows.length === 0) return;

            // Add category title
            doc.setFontSize(12);
            doc.text(title, 14, currentY);
            currentY += 6;

            // Add table
            autoTable(doc, {
                head: [head],
                body: rows,
                startY: currentY,
                margin: { left: 14, right: 14 },
                styles: { fontSize: 9 }
            })

            currentY = doc.lastAutoTable.finalY + 10;
        }

        uniqueDays.forEach((day, index) => {

            // New page except for first day
            if (index > 0) {
                doc.addPage();
                currentY = 15;
            }

            // Day title
            doc.setFontSize(16);
            doc.text(`Day ${day}`, 14, currentY);
            currentY += 10;

            // STAYS
            printCategory("Stays",
                ["Name", "Status", "Price", "Address", "Comments"],
                stays
                    .filter(s => matchDay(s, day) && !s.deleted)
                    .map(s => [s.name, s.status, s.price, s.address, s.comments])
            );

            // EAT & DRINK
            printCategory("Eat & Drink",
                ["Name", "Address", "Comments"],
                eatDrink
                    .filter(e => matchDay(e, day) && !e.deleted)
                    .map(e => [e.name, e.address, e.comments])
            );

            // EXPLORE
            printCategory("Explore",
                ["Name", "Address", "Comments"],
                explore
                    .filter(e => matchDay(e, day) && !e.deleted)
                    .map(e => [e.name, e.address, e.comments])
            );

            // ESSENTIALS
            printCategory("Essentials",
                ["Name", "Address", "Comments"],
                essentials
                    .filter(e => matchDay(e, day) && !e.deleted)
                    .map(e => [e.name, e.address, e.comments])
            );

            // GETTING AROUND
            printCategory("Getting Around",
                ["Name", "Address", "Comments"],
                gettingAround
                    .filter(g => matchDay(g, day) && !g.deleted)
                    .map(g => [g.name, g.address, g.comments])
            );
        });

        doc.save("My_Trip.pdf")
    }

    return (
        <button
            onClick={generatePDF}
            className="general-button bg-[var(--color-pastel-orange)] text-[var(--color-dark-azure)] 
                    transition-transform transform hover:scale-105 hover:shadow-xl active:scale-95 shadow-lg hover:font-bold cursor-pointer"
        > Export to PDF
        </button>
    )
}
