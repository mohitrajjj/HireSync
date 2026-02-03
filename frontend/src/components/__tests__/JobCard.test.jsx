import React from 'react';
import { render } from '@testing-library/react';
import JobCard from '../../components/JobCard';

test('renders JobCard', () => {
  render(<JobCard job={{ title: 'Test Job', company: 'Test Co' }} />);
});
