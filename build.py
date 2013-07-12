import os
import sys
import subprocess

def run(command):
	s = subprocess.Popen(command,
		stderr=subprocess.STDOUT, stdout=subprocess.PIPE, shell=True).communicate()[0]
	return s

action = "f"
build_less = "lessc content/style.less content/style.css"
build_jekyll = "jekyll build"
serve_jekyll = "jekyll serve -w"

if(len(sys.argv) > 1):
	action = sys.argv[1]

def run_less():
	print "Running Less"
	run(build_less)
	print "Less Complete"

def build_site():
	print "building Site"
	run(build_jekyll)
	print "Complete"

if(action == "f"):
	print "Running Full Build"
	run_less()
	build_site()
elif(action == "l"):
	run_less()
elif(action == "r"):
	os.system(serve_jekyll)