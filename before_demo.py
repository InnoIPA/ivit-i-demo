import os, socket, argparse, json

CONF        = "./ivit-i.json"
# MODIFY_JS   = ['./static/js/common.js']
MODIFY_JS   = []
MODIFY_PY   = ['app.py']

SERVER      = "server"
IP          = "ip"
PORT        = "port"

def extract_ip():
    st = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:       
        st.connect(('10.255.255.255', 1))
        IP = st.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        st.close()
    return IP

def parse_cfg_info(conf_path):

    if not os.path.exists(conf_path):
        raise Exception("Could not found config file ({})".format(conf_path))
    
    with open(CONF, 'r') as f:
        data = json.load(f)

    return data

def main(args):

    data = None
    ip, port = "", ""
    
    data = parse_cfg_info(CONF)
    
    # Get server ip
    ip = data[SERVER][IP] if args.ip == "" else args.ip
    if ip in [ "" , "0.0.0.0" ]:
        print("User not setting IP Address, searching dynamically ... ")
        ip = extract_ip()

    # Get server port
    port = data[SERVER][PORT] if args.port == "" else args.port
    
    # Modify JavaScript File
    cnts, lines, texts = [], [], []
    for js_file in MODIFY_JS:
        
        # Open and searching
        with open(js_file, 'r') as f:
            src = f.readlines()
        
        for line, content in enumerate(src):
            
            if 'const DOMAIN' in content:
                print('-'*50, '\n')
                print('Searching DOMAIN in {} ... '.format(js_file))
                print('Found DOMAIN in line {}: {}'.format(line, content.rstrip()))
                
                trg_cnt = "{} = '{}';\n".format(content.split(' = ')[0], ip )
                src[line] = trg_cnt
                print('Modify the DOMAIN: {}'.format(ip))
                continue

            if 'const PORT' in content:
                trg_cnt = "{} = '{}';\n".format(content.split(' = ')[0], port )
                src[line] = trg_cnt
                print('Modify the PORT: {}'.format(port))
            

        # Wrtie js_file
        with open('{}'.format(js_file), 'w') as my_file:
            new_file_contents = "".join(src)
            my_file.write(new_file_contents)
            my_file.close()
    
    # Modify Python File
    for pyfile in MODIFY_PY:
        print("Modify Python File ({})".format(pyfile))
        
        with open(pyfile, 'r') as f:
            src = f.readlines()

        for line, content in enumerate(src):

            key = "app.config['HOST']"
            if key in content:
                src[line]="{}='{}'\n".format( key, ip )
            key = "app.config['PORT']"
            if key in content:
                src[line]="{}='{}'\n".format( key, port )
                break

        with open(pyfile, 'w') as f:
            new_cnt = "".join(src)
            f.write(new_cnt)
            f.close()

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--ip", default="", help="the ivit-i-<platform> ip address")
    parser.add_argument("-p", "--port", default="", help="the ivit-i-<platform> port number")
    args = parser.parse_args()

    main(args)