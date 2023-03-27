import React, {useContext, useState} from 'react';
import {connect, useDispatch} from 'react-redux';
import ContainerBreadCrumbs from '../../../components/ContainerBreadCrumbs';
import ContainerHeader from '../../../components/ContainerHeader';
import {updateClusters} from '../actions/actions';
import {useSnackbar} from 'notistack';

import {Alert, AlertTitle} from '@material-ui/lab';
import ClusterIcon from '@material-ui/icons/Storage';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import {WebSocketContext} from '../../../websockets/WebSocket';
import {useConfirm} from 'material-ui-confirm';
import {useHistory} from 'react-router-dom';
import SaveCancelButtons from '../../../components/SaveCancelButtons';
import SelectNodeComponent from './SelectNodeComponent';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';


const SYNCMODES = ['full', 'dynsec'];

const ClusterNew = (props) => {
	const {clusterManagementFeature} = props;

	const [clustername, setClustername] = useState('Example');
	const [clusterDescription, setClusterDescription] = useState('Example cluster');
	const [syncmode, setSyncmode] = useState('full');
	const [node1, setNode1] = useState({
		nodeId: 1,
		port: 7000
	});
	const [node2, setNode2] = useState({
		nodeId: 2,
		port: 7000
	});
	const [node3, setNode3] = useState({
		nodeId: 3,
		port: 7000
	});

	const clusternameExists = props?.clusters?.find((searchCluster) => {
		return searchCluster.clustername === clustername;
	});

	const nodes = [
		node1, node2, node3
	];

	const areNodeIdsUnique = () => {
		return (new Set([node1.nodeId, node2.nodeId, node3.nodeId])).size === 3;
	};

	const arePrivateAddressesPresent = () => {
		return node1.address && node2.address && node3.address;
	};

	const areBrokersPresent = () => {
		return node1.broker && node2.broker && node3.broker;
	};

	const validate = () => {
		const valid = !clusternameExists && clustername !== ''
					&& arePrivateAddressesPresent()
					&& areBrokersPresent()
					&& areNodeIdsUnique();
		return valid;
	};

	const {enqueueSnackbar} = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const {client} = context;

	const onSaveCluster = async () => {
		try {
			await client.createCluster({
				clustername,
				description: clusterDescription,
				syncmode,
				nodes
			});
			const clusters = await client.listClusters();
			dispatch(updateClusters(clusters));
			history.push(`/clusters`);
			enqueueSnackbar(`Cluster "${clustername}" successfully created.`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error creating cluster "${clustername}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel cluster creation',
			description: `Do you really want to cancel creating this cluster?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		history.goBack();
	};

	return (
		<div>
			<ContainerBreadCrumbs
				title="New"
				links={[
					{ name: 'Home', route: '/home' },
					{ name: 'Clusters', route: '/clusters' }
				]}
			/>
			{/* TODO: Quick hack to detect whether feature is supported */}
			{clusterManagementFeature?.error ? (
				<>
					<br />
					<Alert severity="warning">
						<AlertTitle>{clusterManagementFeature.error.title}</AlertTitle>
						{clusterManagementFeature.error.message}
					</Alert>
				</>
			) : null}
			{!clusterManagementFeature?.error && (
				<div style={{ height: 'calc(100% - 26px)' }}>
					<div style={{ display: 'grid', gridTemplateRows: 'max-content auto', height: '100%' }}>
						<ContainerHeader
							title="New Cluster"
							subTitle="Add a new cluster by assigning existing brokers to the cluster"
						/>
						<Grid container spacing={2} alignItems="flex-end">
							<Grid item xs={12} sm={4}>
								<TextField
									error={clusternameExists}
									helperText={clusternameExists && 'A cluster with this clustername already exists.'}
									required
									id="clustername"
									size="small"
									margin="normal"
									label="Cluster name"
									onChange={(event) => setClustername(event.target.value)}
									defaultValue="Example"
									variant="outlined"
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<ClusterIcon />
											</InputAdornment>
										)
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									required={false}
									id="description"
									size="small"
									margin="normal"
									label="Cluster description"
									onChange={(event) => setClusterDescription(event.target.value)}
									defaultValue="Example cluster"
									variant="outlined"
									fullWidth
								/>
							</Grid>
							<Grid item xs={12} sm={2}>
								<TextField
									required={false}
									id="syncmode"
									size="small"
									margin="normal"
									label="Syncmode"
									onChange={(event) => setSyncmode(event.target.value)}
									defaultValue="full"
									variant="outlined"
									fullWidth
									select
								>
									{SYNCMODES.map((mode) => (
										<MenuItem value={mode}>{mode}</MenuItem>
									))}
								</TextField>
							</Grid>
						</Grid>
						<br />
						<Grid container spacing={2} alignItems="flex-end">
							<Grid item xs={12} sm={4}>
								<Card variant="outlined">
									<CardHeader subheader="Node 1" disableTypography />
									<CardContent style={{ paddingTop: '0px' }}>
										<SelectNodeComponent
											defaultNode={node1}
											setNode={setNode1}
											checkAllNodeIds={areNodeIdsUnique}
										/>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} sm={4}>
								<Card variant="outlined">
									<CardHeader subheader="Node 2" disableTypography />
									<CardContent style={{ paddingTop: '0px' }}>
										<SelectNodeComponent
											defaultNode={node2}
											setNode={setNode2}
											checkAllNodeIds={areNodeIdsUnique}
										/>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} sm={4}>
								<Card variant="outlined">
									<CardHeader subheader="Node 3" disableTypography />
									<CardContent style={{ paddingTop: '0px' }}>
										<SelectNodeComponent
											defaultNode={node3}
											setNode={setNode3}
											checkAllNodeIds={areNodeIdsUnique}
										/>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
						<Grid container xs={12} alignItems="flex-start">
							<Grid item xs={12}>
								<SaveCancelButtons
									onSave={onSaveCluster}
									saveDisabled={!validate()}
									onCancel={onCancel}
								/>
							</Grid>
						</Grid>
					</div>
				</div>
			)}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		clusters: state.clusters?.clusters,
		clusterManagementFeature: state.systemStatus?.features?.clustermanagement,
	};
};

export default connect(mapStateToProps)(ClusterNew);
