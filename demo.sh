function Help()
{
   # Display Help
   echo "Run the docker container."
   echo
   echo "Syntax: scriptTemplate [-p|f|h]"
   echo "options:"
   echo "f		choose a framework"
   echo "h		help."
   echo
}

while getopts ":f:h" option; do
	case $option in
		f )
			framework=$OPTARG
			;;
		h )
			Help
			exit;;
		\? )
			exit;;
	esac
done

python3 before_demo.py -f ${framework}

gunicorn --worker-class eventlet -w 1 --threads 10 --bind 0.0.0.0:4999 app:app
