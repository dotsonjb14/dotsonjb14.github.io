import os
import sys

action = "f"
build_less = "lessc content/style.less content/style.css"
build_jekyll = "jekyll build"
serve_jekyll = "jekyll serve -w"

if(len(sys.argv) > 1):
	action = sys.argv[1]

if(action == "f"):
	print "Full Build"
	print "Running Less"
	os.system(build_less)
	print "Less Complete"
	print "building Site"
	os.system(build_jekyll)
	print "Complete"
elif(action == "r"):
	os.system(serve_jekyll)