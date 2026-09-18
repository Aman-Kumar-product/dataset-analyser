import subprocess
import sys
import os
import argparse

def main():
    parser = argparse.ArgumentParser(description="Run the ML pipeline.")
    parser.add_argument("csv_files", nargs='*', default=["master_dataset.csv"], help="The input CSV files")
    parser.add_argument("--stage", choices=["cluster", "synthesize", "all"], default="all", help="Stage to run")
    parser.add_argument("--intent", default="", help="Comma separated intents")
    parser.add_argument("--keywords", default="", help="Comma separated keywords")
    args = parser.parse_args()
    
    csv_files = args.csv_files
    stage = args.stage
    intent = args.intent
    keywords = args.keywords
    
    if stage in ["all", "cluster"] and csv_files:
        for f in csv_files:
            if not os.path.exists(f):
                print(f"Error: {f} does not exist.")
                sys.exit(1)
        
    scripts = []
    if stage in ["all", "cluster"]:
        scripts.extend([
            ("ingest.py", csv_files),
            ("filter.py", [intent, keywords]),
            ("embed.py", []),
            ("cluster.py", [])
        ])
    if stage in ["all", "synthesize"]:
        scripts.append(("synthesis.py", []))
    
    for script, script_args in scripts:
        print(f"\n======================================")
        print(f"Running {script}...")
        print(f"======================================")
        
        result = subprocess.run([sys.executable, script] + script_args)
        if result.returncode != 0:
            print(f"\nPipeline failed during {script}")
            sys.exit(1)
            
    print("\n[SUCCESS] Pipeline completed successfully!")

if __name__ == "__main__":
    main()
