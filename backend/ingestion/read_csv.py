# read_csv.py
import pandas as pd

# Path to the CSV file from the repository
csv_path = "./SB_publication_PMC.csv"  # adjust if your CSV is in a different folder

# Load the CSV
df = pd.read_csv(csv_path, header=None, names=["title","pmc_url"])

# Print basic info
print("Total papers:", len(df))
print("First 5 rows:")
print(df.head())
