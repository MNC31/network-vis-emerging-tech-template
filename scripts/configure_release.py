"""Generate real deployment and notebook links after the instructor creates the repository."""
import argparse,re
from pathlib import Path
from urllib.parse import quote
ap=argparse.ArgumentParser();ap.add_argument('--repo',required=True);ap.add_argument('--branch',default='main');args=ap.parse_args()
repo=args.repo.rstrip('/').removesuffix('.git')
if not re.fullmatch(r'https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',repo):ap.error('Use the public repository URL: https://github.com/owner/repository')
if not re.fullmatch(r'[A-Za-z0-9_.-]+',args.branch):ap.error('Use a simple branch name')
owner_repo=repo.split('github.com/')[1]
deploy='https://vercel.com/new/clone?repository-url='+quote(repo,safe='')
text='# Deploy and open notebooks\n\nRepository: '+repo+'\n\n[![Deploy with Vercel](https://vercel.com/button)]('+deploy+')\n\nThe button starts the provider’s project-creation flow. Login and setup are required.\n\n'
for p in sorted(Path('notebooks').glob('*.ipynb')):
    if '_R.' not in p.name:text+='['+p.stem+'](https://colab.research.google.com/github/'+owner_repo+'/blob/'+args.branch+'/notebooks/'+quote(p.name)+')\n\n'
Path('DEPLOY_LINKS.md').write_text(text)
print('Wrote DEPLOY_LINKS.md with the supplied repository URL. Commit it to publish the real links.')
