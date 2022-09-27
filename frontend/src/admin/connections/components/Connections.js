import React, { useContext } from 'react';
import { makeStyles, withStyles, useTheme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import AddIcon from '@material-ui/icons/Add';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import ConfigurationIcon from '@material-ui/icons/Tune';

import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import { updateBrokerConfigurations, updateBrokerConnections, updateSelectedConnection } from '../../../actions/actions';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PremiumFeatureDialog from '../../../components/PremiumFeatureDialog';
import BrokerStatusIcon from '../../../components/BrokerStatusIcon';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

// import {
// 	colors,
//   } from '@material-ui/core';


const GROUP_TABLE_COLUMNS = [
	{ id: 'expand', key: '' },
	{ id: 'id', key: 'ID' },
	{ id: 'configurationName', key: 'Name' },
	{ id: 'URL', key: 'URL' },
	{ id: 'status', key: 'Status' }
];

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		},
		cursor: 'pointer'
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	avatar: {
		backgroundColor: 'white'
	},
	imageIcon: {
		height: '100%',
		width: '20px'
	},
	iconRoot: {
		textAlign: 'center'
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));




const CustomRow = (props) => {
	const { enqueueSnackbar } = useSnackbar();

	const initialCursorPosInfo = {
		mouseX: null,
		mouseY: null,
	};

	const { brokerConnection, handleBrokerConnectionConnectDisconnect, onDeleteConnection } = props;
	const [open, setOpen] = React.useState(false);

	const [cursorPosInfo, setCursorPosInfo] = React.useState(initialCursorPosInfo);
	// const [textToCopy, setTextToCopy] = React.useState({
	// 	internalUrl: '',
	// 	externalUrl: '',
	// });

	const handleClick = (event) => {
	  event.preventDefault();
	  setCursorPosInfo({
		mouseX: event.clientX - 2,
		mouseY: event.clientY - 4,
	  });
	};
  
	const handleClose = () => {
		setCursorPosInfo(initialCursorPosInfo);
	};


	const copyText = (text) => {
		try {
			navigator.clipboard.writeText(text);
			enqueueSnackbar(`Text copied successfully`, {
				variant: 'success'
			});
		} catch(error) {
			enqueueSnackbar(`Couldn't copy text: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}

		handleClose();
	}

	const externalURLExists = (brokerConnection.externalUrl !== brokerConnection.url);
	const makeCollapsible = externalURLExists || brokerConnection.ca || brokerConnection.cert || brokerConnection.key;
	const numberOfAdditionalFields = !!externalURLExists + !!brokerConnection.ca + !!brokerConnection.cert + !!brokerConnection.key;
	const columnSize = (numberOfAdditionalFields === 1) ? 12 : 6;

	return <>
		<StyledTableRow
		//   style={{ cursor: "pointer" }}
			// onClick={() => onSelectConnection(brokerConnection)}
			onClick={props.onClick}
			key={brokerConnection.name}
			onContextMenu={handleClick}
		>
			<TableCell>
				<IconButton aria-label="expand row" size="small"
					disabled={!makeCollapsible}
					onClick={(event) =>{
						event.stopPropagation();
						setOpen(!open);
					}}>
					{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
				</IconButton>
			</TableCell>
			<TableCell>{brokerConnection.id}</TableCell>
			<TableCell>{brokerConnection.name}</TableCell>
			<TableCell>{brokerConnection.externalUrl || brokerConnection.url}</TableCell>
			<TableCell>
				<BrokerStatusIcon brokerConnection={brokerConnection} />
				{ }
			</TableCell>
			<TableCell align="right">
				<Tooltip title={brokerConnection.status?.connected ? 'Disconnect' : 'Connect'}>
					<Switch
						checked={brokerConnection.status?.connected}
						name="connectionConnected"
						onClick={(event) => {
							event.stopPropagation();
							handleBrokerConnectionConnectDisconnect(brokerConnection.id, event.target.checked);
						}}
						inputProps={{ 'aria-label': 'Connection connected' }}
					/>
				</Tooltip>
				<IconButton
					disabled={brokerConnection.status?.connected}
					size="small"
					onClick={(event) => {
						event.stopPropagation();
						onDeleteConnection(brokerConnection.id);
					}}
				>
					<DeleteIcon fontSize="small" />
				</IconButton>
			</TableCell>
		</StyledTableRow>
		<TableRow>
			<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
				<Collapse in={open} timeout="auto" unmountOnExit>
					<Box margin={1} style={{marginTop: '16px'}} align="center">
						{/* {brokerConnection.externalUrl ? <Typography>Internal URL: {brokerConnection.url}</Typography> : null} */}
						<Grid container spacing={2} alignItems="flex-end">
							{externalURLExists ? <Grid item xs={columnSize} align="center">
																<Typography style={{fontSize: 'small'}}>
																	<span style={{fontWeight: 'bold'}}>Internal URL: </span>{brokerConnection.url}
																</Typography>
															</Grid>
							: null}
							{brokerConnection.ca ? <Grid item xs={columnSize} align="center">
														<Typography style={{fontSize: 'small'}}>
															<span style={{fontWeight: 'bold'}}>CA Cert File: </span>{brokerConnection.caFile}
														</Typography>
													</Grid>
							: null}
							{brokerConnection.cert ? <Grid item md={columnSize} align="center">
														<Typography style={{fontSize: 'small'}}>
															<span style={{fontWeight: 'bold'}}>Client Cert File: </span>{brokerConnection.certFile}
														</Typography>
													</Grid>
							: null}
							{brokerConnection.key ? <Grid item md={columnSize} align="center">
														<Typography style={{fontSize: 'small'}}>
															<span style={{fontWeight: 'bold'}}>Private Key File: </span>{brokerConnection.keyFile}
														</Typography>
													</Grid>
							: null}
						</Grid>
					</Box>
				</Collapse>
			</TableCell>
		</TableRow>
		<Menu
			keepMounted
			open={cursorPosInfo.mouseY !== null}
			onClose={handleClose}
			anchorReference="anchorPosition"
			anchorPosition={
			cursorPosInfo.mouseY !== null && cursorPosInfo.mouseX !== null
				? { top: cursorPosInfo.mouseY, left: cursorPosInfo.mouseX }
				: undefined
			}
		>
			{!externalURLExists ? <MenuItem onClick={() => copyText(brokerConnection.url)}>Copy URL</MenuItem> : null}
			{externalURLExists ? <MenuItem onClick={() => copyText(brokerConnection.url)}>Copy Internal URL</MenuItem> : null}
			{externalURLExists ? <MenuItem onClick={() => copyText(brokerConnection.externalUrl)}>Copy External URL</MenuItem> : null}
		</Menu>
	</>
};



const Connections = ({ brokerConnections, onSort, sortBy, sortDirection }) => {
	const classes = useStyles();
	const history = useHistory();
	const dispatch = useDispatch();
	const theme = useTheme();
	const context = useContext(WebSocketContext);
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();
	const { client: brokerClient } = context;
	const [connection, setConnection] = React.useState('');
	
	const [premiumFeatureDialogOpen, setPremiumFeatureDialogOpen] = React.useState(false);

	const handleClosePremiumFeatureDialog = () => {
		setPremiumFeatureDialogOpen(false);
	}

	const onNewConnection = () => {
		history.push('/config/connections/new');
	};


	const onSelectConnection = async (connection) => {
		dispatch(updateSelectedConnection(connection));
		history.push(`/config/connections/detail/${connection.id}`);
	};


	const loadConnections = async () => {
		const brokerConnections = await brokerClient.getBrokerConnections();
		dispatch(updateBrokerConnections(brokerConnections));
		const brokerConfigurations = await brokerClient.getBrokerConfigurations();
		dispatch(updateBrokerConfigurations(brokerConfigurations));
	}

	const onConnectServerToBroker = async (id) => {
		try {
			await brokerClient.connectServerToBroker(id);
			enqueueSnackbar(`Connection "${id}" successfully established`, {
				variant: 'success'
			});
		} catch (error) {
			// setPremiumFeatureDialogOpen(true);
			enqueueSnackbar(`Error connecting broker. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
		}
		await loadConnections();
	}

	const onDisconnectServerFromBroker = async (id) => {
		try {

			let connections = await brokerClient.getBrokerConnections();
			const connected = connections.filter(connection => connection?.status?.connected);
			// if (connected?.length === 1) {
			// 	enqueueSnackbar(`Error disconnecting broker. Reason: at least one broker needs to be connected.`, {
			// 		variant: 'error'
			// 	});
			// 	return;
			// }

			await confirm({
				title: 'Confirm disconnecting',
				description: `Do you really want to disconnect the connection "${id}"?`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});

			await brokerClient.disconnectServerFromBroker(id);
			enqueueSnackbar(`Connection "${id}" successfully closed`, {
				variant: 'success'
			});
			connections = await brokerClient.getBrokerConnections();
			dispatch(updateBrokerConnections(connections));
		} catch (error) {
			// setPremiumFeatureDialogOpen(true);
			enqueueSnackbar(`Error disconnecting broker. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
			// enqueueSnackbar(`Error disconnecting broker. Note that this feature is only available in the premium version.`, {
			// 	variant: 'error'
			// });
		}
		await loadConnections();
	}

	const handleBrokerConnectionConnectDisconnect = async (id, connect) => {
		if (connect) {
			await onConnectServerToBroker(id);
		} else {
			await onDisconnectServerFromBroker(id);
		}
	};

	const onDeleteConnection = async (id) => {
		try {
			await confirm({
				title: 'Confirm connection deletion',
				description: `Do you really want to delete connection "${id}"?`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
			await brokerClient.deleteConnection(id);
			enqueueSnackbar(`Connection "${id}" successfully deleted`, {
				variant: 'success'
			});
			const connections = await brokerClient.getBrokerConnections();
			dispatch(updateBrokerConnections(connections));
		} catch (error) {
			// setPremiumFeatureDialogOpen(true);
			enqueueSnackbar(`Error deleting connection. Reason: ${error.message ? error.message : error}`, {
				variant: 'error'
			});
			// enqueueSnackbar(`Error disconnecting broker. Note that this feature is only available in the premium version.`, {
			// 	variant: 'error'
			// });
		}
	};

	return (
		<div>
			<PremiumFeatureDialog open={premiumFeatureDialogOpen} handleClose={handleClosePremiumFeatureDialog} />
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/config">
					Config
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Connections
				</Typography>
			</Breadcrumbs>
			<br />
			<Button
				variant="outlined"
				color="default"
				size="small"
				className={classes.button}
				startIcon={<AddIcon />}
				onClick={(event) => {
					event.stopPropagation();
					onNewConnection();
				}}
			>
				New Connection
			</Button>
			<br />
			<br />
			{brokerConnections && brokerConnections?.length > 0 ? (
				<div>
					<Hidden xsDown implementation="css">
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										{GROUP_TABLE_COLUMNS.map((column) => (
											<TableCell
												key={column.id}
												// sortDirection={sortBy === column.id ? sortDirection : false}
											>
												{/* <TableSortLabel
													active={sortBy === column.id}
													direction={sortDirection}
													// onClick={() => onSort(column.id)}
												>
													{column.key}
												</TableSortLabel> */}
												{column.key}
											</TableCell>
										))}
										<TableCell />
									</TableRow>
								</TableHead>
								<TableBody>
									{brokerConnections &&
										brokerConnections
											.sort((a, b) => a.name.localeCompare(b.name))
											.map((brokerConnection) => (
												<CustomRow 
													hover
													onClick={() => onSelectConnection(brokerConnection)}
													brokerConnection={brokerConnection}
													handleBrokerConnectionConnectDisconnect={handleBrokerConnectionConnectDisconnect}
													onDeleteConnection={onDeleteConnection}
												/>
											))}
								</TableBody>
							</Table>
						</TableContainer>
					</Hidden>
					<Hidden smUp implementation="css">
						<Paper>
							<List className={classes.root}>
								{brokerConnections && Array.isArray(brokerConnections)
									? brokerConnections.map((brokerConnection) => (
										<React.Fragment>
											<ListItem alignItems="flex-start">
												<ListItemText
													primary={<span>{brokerConnection.name}</span>}
													secondary={
														<React.Fragment>
															<Typography
																component="span"
																variant="body2"
																className={classes.inline}
																color="textPrimary"
															>
																{brokerConnection.externalUrl || brokerConnection.url}
															</Typography>
														</React.Fragment>
													}
												/>
												{/* <ListItemSecondaryAction>
					  <IconButton edge="end" aria-label="edit">
						<EditIcon />
					  </IconButton>
					  <IconButton edge="end" aria-label="delete">
						<DeleteIcon />
					  </IconButton>
					</ListItemSecondaryAction> */}
											</ListItem>
											<Divider />
										</React.Fragment>
									))
									: null}
							</List>
						</Paper>
					</Hidden>
				</div>
			) : (
				<div>No connections found</div>
			)}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections
	};
};

export default connect(mapStateToProps)(Connections);
