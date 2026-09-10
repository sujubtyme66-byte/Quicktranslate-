import subprocess
import os

os.makedirs('public/samples', exist_ok=True)
font = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'

# 1. Tech Keynote (15 seconds)
cmd_tech = [
    'ffmpeg', '-y',
    '-f', 'lavfi',
    '-i', 'color=c=0x0B1120:s=1280x720:d=15:r=30',
    '-f', 'lavfi',
    '-i', 'aevalsrc=0.08*sin(2*PI*220*t)+0.05*sin(2*PI*330*t)+0.04*sin(2*PI*440*t):s=44100:d=15',
    '-filter_complex',
    f'[0:v]drawbox=x=0:y=0:w=1280:h=720:color=0x1E1B4B@0.6:t=fill,'
    f'drawbox=x=80:y=80:w=1120:h=560:color=0x4338CA@0.2:t=fill,'
    f'drawbox=x=80:y=80:w=1120:h=560:color=0x6366F1@0.5:t=2,'
    f'drawtext=fontfile={font}:text=\'GLOBAL AI & QUANTUM KEYNOTE\':x=120:y=130:fontsize=22:fontcolor=0x818CF8,'
    f'drawtext=fontfile={font}:text=\'Computational Intelligence in Video\':x=120:y=220:fontsize=48:fontcolor=0xFFFFFF,'
    f'drawtext=fontfile={font}:text=\'Dr. Evelyn Vance  •  Chief AI Scientist\':x=120:y=300:fontsize=26:fontcolor=0xCBD5E1,'
    f'drawtext=fontfile={font}:text=\'Real-Time Multilingual Speech & Subtitle Synchronization\':x=120:y=370:fontsize=20:fontcolor=0x94A3B8,'
    f'drawbox=x=120:y=460:w=1040:h=6:color=0x334155:t=fill,'
    f'drawbox=x=120:y=460:w=\'min(1040,1040*t/15)\':h=6:color=0x6366F1:t=fill,'
    f'drawtext=fontfile={font}:text=\'LIVE KEYNOTE STREAM  •  MULTILINGUAL DUBBING ACTIVE\':x=120:y=490:fontsize=16:fontcolor=0x64748B'
    f'[vout];[1:a]afade=t=in:ss=0:d=1,afade=t=out:st=14:d=1[aout]',
    '-map', '[vout]',
    '-map', '[aout]',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    'public/samples/tech-keynote.mp4'
]

# 2. Nature Documentary (18 seconds)
cmd_nature = [
    'ffmpeg', '-y',
    '-f', 'lavfi',
    '-i', 'color=c=0x022C43:s=1280x720:d=18:r=30',
    '-f', 'lavfi',
    '-i', 'aevalsrc=0.06*sin(2*PI*174*t)+0.04*sin(2*PI*261*t)+0.03*sin(2*PI*392*t):s=44100:d=18',
    '-filter_complex',
    f'[0:v]drawbox=x=0:y=0:w=1280:h=720:color=0x056676@0.4:t=fill,'
    f'drawbox=x=80:y=80:w=1120:h=560:color=0x00B4D8@0.15:t=fill,'
    f'drawbox=x=80:y=80:w=1120:h=560:color=0x00B4D8@0.4:t=2,'
    f'drawtext=fontfile={font}:text=\'OCEANIC NATURE SANCTUARIES\':x=120:y=130:fontsize=22:fontcolor=0x38BDF8,'
    f'drawtext=fontfile={font}:text=\'Deep Ocean Exploration & Marine Life\':x=120:y=220:fontsize=48:fontcolor=0xFFFFFF,'
    f'drawtext=fontfile={font}:text=\'Narrator  •  Marine Biology Institute\':x=120:y=300:fontsize=26:fontcolor=0xE2E8F0,'
    f'drawtext=fontfile={font}:text=\'Preserving fragile marine ecosystems and planetary biodiversity\':x=120:y=370:fontsize=20:fontcolor=0x94A3B8,'
    f'drawbox=x=120:y=460:w=1040:h=6:color=0x1E293B:t=fill,'
    f'drawbox=x=120:y=460:w=\'min(1040,1040*t/18)\':h=6:color=0x38BDF8:t=fill,'
    f'drawtext=fontfile={font}:text=\'DOCUMENTARY AUDIO TRACK • STEREO 48KHZ\':x=120:y=490:fontsize=16:fontcolor=0x64748B'
    f'[vout];[1:a]afade=t=in:ss=0:d=1,afade=t=out:st=17:d=1[aout]',
    '-map', '[vout]',
    '-map', '[aout]',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    'public/samples/nature-documentary.mp4'
]

# 3. Culinary Masterclass (15 seconds)
cmd_culinary = [
    'ffmpeg', '-y',
    '-f', 'lavfi',
    '-i', 'color=c=0x271306:s=1280x720:d=15:r=30',
    '-f', 'lavfi',
    '-i', 'aevalsrc=0.07*sin(2*PI*261.63*t)+0.05*sin(2*PI*329.63*t)+0.03*sin(2*PI*392*t):s=44100:d=15',
    '-filter_complex',
    f'[0:v]drawbox=x=0:y=0:w=1280:h=720:color=0x78350F@0.35:t=fill,'
    f'drawbox=x=80:y=80:w=1120:h=560:color=0xD97706@0.15:t=fill,'
    f'drawbox=x=80:y=80:w=1120:h=560:color=0xF59E0B@0.4:t=2,'
    f'drawtext=fontfile={font}:text=\'TUSCAN CULINARY ACADEMY\':x=120:y=130:fontsize=22:fontcolor=0xFBBF24,'
    f'drawtext=fontfile={font}:text=\'The Secret of Traditional Egg Pasta\':x=120:y=220:fontsize=48:fontcolor=0xFFFFFF,'
    f'drawtext=fontfile={font}:text=\'Chef Marco Bellini  •  Florence, Italy\':x=120:y=300:fontsize=26:fontcolor=0xFEF3C7,'
    f'drawtext=fontfile={font}:text=\'Mastering artisanal dough texture and multi-generational techniques\':x=120:y=370:fontsize=20:fontcolor=0xD1D5DB,'
    f'drawbox=x=120:y=460:w=1040:h=6:color=0x292524:t=fill,'
    f'drawbox=x=120:y=460:w=\'min(1040,1040*t/15)\':h=6:color=0xF59E0B:t=fill,'
    f'drawtext=fontfile={font}:text=\'LESSON CUE TRACK • AUDIO / DUB CHANNEL READY\':x=120:y=490:fontsize=16:fontcolor=0x78716C'
    f'[vout];[1:a]afade=t=in:ss=0:d=1,afade=t=out:st=14:d=1[aout]',
    '-map', '[vout]',
    '-map', '[aout]',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    'public/samples/culinary-masterclass.mp4'
]

print("Generating tech keynote...")
subprocess.run(cmd_tech, check=True)
print("Generating nature documentary...")
subprocess.run(cmd_nature, check=True)
print("Generating culinary masterclass...")
subprocess.run(cmd_culinary, check=True)
print("Done!")
