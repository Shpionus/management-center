const normalize = (host = '') => {
	if (host.startsWith('//')) return host.substring(2);
	if (host.startsWith('/')) return host.substring(1);
	return host;
};
const getConnectionInfo = (connection) => {
	const { id, name, url = '' } = connection;
	const parts = url.split(':');
	return { id, name, protocol: parts[0], host: normalize(parts[1]), port: parts[2] };
};

const byHostAndPort = (all, { host, port, bindAddress }) => {
	if (bindAddress) host = bindAddress;
	all.add(host);
	all.add(`${host}:${port}`);
	return all;
};
const selectByHost = (used) => (conn) => used.has(conn.host);
const selectByHostAndPort = (used) => (conn) => used.has(`${conn.host}:${conn.port}`);

const getUsedConnections = (availableConnections = [], listeners = []) => {
	const usedHosts = listeners.reduce(byHostAndPort, new Set());
	const connections = availableConnections.map((broker) => getConnectionInfo(broker));
	let usedConnections = connections.filter(selectByHostAndPort(usedHosts));
	if (!usedConnections.length) usedConnections = connections.filter(selectByHost(usedHosts));
	return usedConnections.map(({ id, name }) => ({ id, name }));
};

const mapSubjectKeys = {
	CN: 'Common Name',
	L: 'Locality',
	ST: 'State Or Province',
	O: 'Organization',
	OU: 'Organization Unit',
	C: 'Country Code',
	E: 'E-Mail',
	STREET: 'Street',
	emailAddress: 'E-Mail'
	// DC: 'Domain'
	// UID: 'User ID'
};
const toObj = (delimiter, mapKey) => (obj, str) => {
	const [key, value] = str.split(delimiter);
	obj[mapKey(key)] = value;
	return obj;
};
const identity = (v) => v;
const mapSubjectKey = (key) => mapSubjectKeys[key] || key;
const parseSubjectInfo = (str, mapKey = identity) => (str ? str.split('\n').reduce(toObj('=', mapKey), {}) : {});

const isValid = ({ cert, id, filename }) => cert || (id && filename);
const loadCertificateInfo = async (certificate, client) => {
	if (isValid(certificate)) {
		try {
			const { data: info } = await client.getCertificateInfo(certificate);
			return { info };
		} catch (error) {
			return { error };
		}
	}
	return { info: undefined };
};

export { getConnectionInfo, getUsedConnections, mapSubjectKey, parseSubjectInfo, loadCertificateInfo };
