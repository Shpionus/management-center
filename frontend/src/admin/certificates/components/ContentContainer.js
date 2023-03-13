import React from 'react';
import { Hidden } from '@material-ui/core';
import PathCrumbs from './PathCrumbs';

const getHeaderContent = (children) => {
	children = children.length ? children : children.props && children.props.children;
	const [header, content] = children?.length ? children : [children];
	return { header: content && header, content: content || header };
};
const ContentContainer = ({ children, path }) => {
	// expecting header and content
	const { header, content } = getHeaderContent(children);
	return (
		<div style={{ height: '100%' }}>
			{path && path.length && <PathCrumbs path={path} />}
			<div style={{ height: 'calc(100% - 26px)' }}>
				<div style={{ display: 'grid', gridTemplateRows: 'max-content auto', height: '100%' }}>
					{header}
					<div style={{ heigth: '100%', overflowY: 'visible' }}>
						<Hidden xsDown implementation="css">
							{content}
						</Hidden>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ContentContainer;