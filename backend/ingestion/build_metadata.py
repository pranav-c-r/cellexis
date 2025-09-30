import pandas as pd

# Load the CSV you just downloaded
csv_path = "./SB_publication_PMC.csv"
df = pd.read_csv(csv_path, header=None, names=["title", "pmc_url"])

# Add a unique paper_id
df["paper_id"] = range(1, len(df) + 1)

# Rearrange columns
df = df[["paper_id", "title", "pmc_url"]]

# Save as metadata.csv inside the ingestion folder
df.to_csv("metadata.csv", index=False)

print("metadata.csv created successfully!")
print(df.head())
