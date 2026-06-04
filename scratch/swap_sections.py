import sys
import re

file_path = r"c:\Projects\SayanAgentforge\AgentForge\app\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Using regex to find the blocks to avoid exact whitespace matching issues
pattern1 = r"(?s)({\/\*\s*──\s*INTERACTIVE CORE SPECIFICATION SHOWCASE.*?)(?={\/\*\s*──\s*ABOUT AGENTFORGE VIDEO SECTION)"
pattern2 = r"(?s)({\/\*\s*──\s*ABOUT AGENTFORGE VIDEO SECTION.*?)(?={\/\*\s*──\s*CRYPTOGRAPHIC AUDIT AND VERIFIER SECTION)"

m1 = re.search(pattern1, content)
m2 = re.search(pattern2, content)

if m1 and m2:
    sec1 = m1.group(1)
    sec2 = m2.group(1)
    
    # We just replace the combined chunk of both sections with sec2 + sec1
    combined_original = sec1 + sec2
    combined_new = sec2 + sec1
    
    if combined_original in content:
        new_content = content.replace(combined_original, combined_new)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Swapped successfully")
    else:
        print("Could not find combined string in content. Maybe they are not adjacent?")
else:
    print("Could not find one or more markers")
