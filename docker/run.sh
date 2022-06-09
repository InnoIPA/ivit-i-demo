#!/bin/bash
source "$(dirname $(realpath $0))/utils.sh"

# setup parameters
docker_image="init-i-demo"
docker_name=${docker_image}
workspace="/workspace"
web=false
platform=""
set_vision=""
command="bash"

# Help information
function help(){
	echo "Run the iNIT-I-DEMO environment."
	echo
	echo "Syntax: scriptTemplate [-f|wsh]"
	echo "options:"
	echo "f		Setup platform like [ nvidia, intel, xillinx ]."
	echo "w		run container with Web API."
	echo "s		Server mode for non vision user"
	echo "h		help."
}

# Parse the argument
while getopts "f:wsh" option; do
	case $option in
		w )
			web=true
			;;
		f )
			platform=$OPTARG
			;;
		s )
			server=true
			;;
		h )
			help
			exit
			;;
		\? )
			help
			exit
			;;
		* )
			help
			exit
			;;
	esac
done

# About Platform
if [[ ! ${platform} = "" ]];then
	printd "Run web demo ... " Cy
	command="./demo.sh -f ${platform}"
fi

# SERVER or DESKTOP MODE
if [[ ${server} = false ]];then
	mode="DESKTOP"
	set_vision="-v /etc/localtime:/etc/localtime:ro -v /tmp/.x11-unix:/tmp/.x11-unix:rw -e DISPLAY=unix${DISPLAY}"
	# let display could connect by every device
	xhost + > /dev/null 2>&1
else
	mode="SERVER"
fi


docker_cmd="docker run \
--name ${docker_name} \
--rm -it \
--net=host --ipc=host \
-w ${workspace} \
-v `pwd`:${workspace} \
${set_vision} \
${docker_image} \"${command}\""

printd ${docker_cmd}

bash -c "${docker_cmd}"