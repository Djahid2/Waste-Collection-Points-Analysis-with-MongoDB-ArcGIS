import csv

def add_id_to_csv(input_file, output_file):
    with open(input_file, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        rows = list(reader)
        
    if not rows:
        print("The file is empty.")
        return

    header = ["id"] + rows[0]  # Add "id" column to the header
    updated_rows = [header] + [[i] + row for i, row in enumerate(rows[1:], start=0)]

    with open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(updated_rows)
    
    print(f"Updated CSV saved to {output_file}")

# Example usage
add_id_to_csv("routes_bab_ezzouar.csv", "routes_bab_ezzouar.csv")
