#!/bin/bash
CONF="ivit-i.json"

IP=$(cat ${CONF} | jq -r '.server.ip')
PLATFORM=$(cat ${CONF} | jq -r '.server.platform')
PORT=$(cat ${CONF} | jq -r '.server.port')




# Help information
function help(){
	echo "Run the iVIT-I-DEMO environment."
	echo
	echo "Syntax: scriptTemplate [-f|b|i|p]"
	echo "options:"
	echo "b		brand or platform"   
    echo "i		ip"
    echo "p		port"
	echo "h		help."
}

# Parse the argument
while getopts ":b:i:p:" option; do
	case $option in
		b )
			PLA=$OPTARG ;;
		i )
			IP=$OPTARG ;;
        p )
			PORT=$OPTARG ;;
        h )
			help; exit ;;
		\? )
			help; exit ;;
		* )
			help; exit ;;
	esac
done


CNT=$(jq \
--arg ip "${IP}" --arg pla "${PLATFORM}" --arg port "${PORT}" \
'.server.ip = $ip | .server.platform = $pla | .server.port = $port' \
${CONF})

echo -E "${CNT}" > ivit-i.json
